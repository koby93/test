import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { PrismaService } from '../src/platform/database/prisma.service';
import { RedisService } from '../src/platform/cache/redis.service';
import { StorageService } from '../src/platform/storage/storage.service';
import { PlatformLogger } from '../src/platform/logging/platform-logger.service';
import { AuthorizationService } from '../src/platform/auth/authorization.service';
import { AuditService } from '../src/platform/audit/audit.service';
import { validateEnvironment } from '../src/platform/config/environment';
import { WorkflowRegistry } from '../src/platform/workflow/workflow.registry';
import { WorkflowService } from '../src/platform/workflow/workflow.service';
import { actor, reviewDefinition, testEnvironment } from './helpers';

describe('Module 0 with real PostgreSQL, Redis and MinIO', () => {
  let prisma: PrismaService;
  let redis: RedisService;
  let storage: StorageService;
  let audit: AuditService;
  let registry: WorkflowRegistry;
  let workflow: WorkflowService;
  let requirementsMet = true;
  let evidenceValid = true;
  const definition = reviewDefinition();
  beforeAll(async () => {
    const config = new ConfigService(validateEnvironment({ ...testEnvironment, ...process.env, NODE_ENV: 'test', LOG_LEVEL: 'silent' }));
    prisma = new PrismaService(config);
    redis = new RedisService(config, new PlatformLogger(config));
    storage = new StorageService(config);
    await prisma.onModuleInit();
    await redis.onModuleInit();
    registry = new WorkflowRegistry();
    registry.registerCondition('test.requirementsMet', async () => ({ passed: requirementsMet, code: requirementsMet ? 'MET' : 'NOT_MET' }));
    registry.registerValidator('test.evidenceValid', async () => ({ passed: evidenceValid, code: evidenceValid ? 'VALID' : 'INVALID' }));
    registry.registerDefinition(definition);
    registry.registerDefinition(reviewDefinition('UAT_CONFORMITY'));
    audit = new AuditService();
    workflow = new WorkflowService(prisma, registry, new AuthorizationService(), audit);
  });
  beforeEach(() => { requirementsMet = true; evidenceValid = true; jest.restoreAllMocks(); });
  afterAll(async () => {
    if (redis) await redis.onModuleDestroy();
    if (storage) storage.onModuleDestroy();
    if (prisma) await prisma.onModuleDestroy();
  });
  const fixture = async (withDocument = true, kind: 'TECHNICAL_CLEARANCE' | 'UAT_CONFORMITY' = 'TECHNICAL_CLEARANCE') => {
    const projectId = randomUUID();
    await prisma.project.create({ data: { id: projectId, institutionId: 'institution-test', createdBy: 'fixture', updatedBy: 'fixture' } });
    let documentId: string | undefined;
    if (withDocument) {
      const document = await prisma.document.create({ data: { projectId, type: 'TEST_REPORT', createdBy: 'fixture', updatedBy: 'fixture', versions: { create: { number: 1, objectKey: `test/${randomUUID()}`, checksum: 'synthetic-v1', createdBy: 'fixture' } } } });
      documentId = document.id;
    }
    const definition = reviewDefinition(kind);
    const instance = await workflow.createInstance(projectId, definition.key, 1, actor('MDA_USER'), randomUUID());
    const reviewer = actor(kind === 'TECHNICAL_CLEARANCE' ? 'TECHNICAL_WORKING_GROUP' : 'TECHNICAL_ASSESSMENT_UAT_TEAM');
    const command = { instanceId: instance.id, requestId: randomUUID(), currentState: 'QUEUED', targetState: 'ASSESSED', expectedVersion: 0, evidenceRevision: 1, comments: 'Synthetic foundation test.' };
    return { projectId, instance, reviewer, command, documentId };
  };
  it('connects to all actual dependencies and persists Redis/S3 data', async () => {
    await expect(prisma.ping()).resolves.toBeUndefined();
    await expect(redis.ping()).resolves.toBe('PONG');
    await expect(storage.ping()).resolves.toBeUndefined();
    const key = `module0-test:${randomUUID()}`;
    const objectKey = `foundation-tests/${randomUUID()}`;
    try {
      await redis.client.set(key, 'verified', { EX: 60 });
      expect(await redis.client.get(key)).toBe('verified');
      await storage.client.send(new PutObjectCommand({ Bucket: storage.bucket, Key: objectKey, Body: 'synthetic-foundation-evidence', ContentType: 'text/plain' }));
      const object = await storage.client.send(new GetObjectCommand({ Bucket: storage.bucket, Key: objectKey }));
      expect(await object.Body?.transformToString()).toBe('synthetic-foundation-evidence');
    } finally {
      await redis.client.del(key);
      await storage.client.send(new DeleteObjectCommand({ Bucket: storage.bucket, Key: objectKey }));
    }
  });
  it.each(['TECHNICAL_CLEARANCE', 'UAT_CONFORMITY'] as const)('persists the full governed %s sequence under one Project ID', async kind => {
    const fixtureData = await fixture(true, kind);
    const definition = reviewDefinition(kind);
    for (const [index, rule] of definition.transitions.entries()) {
      const transition = await workflow.transition({ ...fixtureData.command, requestId: randomUUID(), currentState: rule.currentState, targetState: rule.targetState, expectedVersion: index }, actor(rule.authorizedRoles[0]!), randomUUID());
      expect(transition.projectId).toBe(fixtureData.projectId);
      expect(transition.auditReference).toBeTruthy();
      expect(transition.requiredDocuments).toEqual([{ type: 'TEST_REPORT', minimumVersion: 1 }]);
      expect(transition.actorId).toBeTruthy();
      expect(transition.timestamp).toBeInstanceOf(Date);
    }
    const transitions = await prisma.workflowTransition.findMany({ where: { instanceId: fixtureData.instance.id }, include: { audit: true, evidence: true } });
    expect(transitions).toHaveLength(4);
    expect(transitions.every(item => item.projectId === item.audit.projectId && item.evidence.length === 1)).toBe(true);
    expect((await prisma.workflowInstance.findUniqueOrThrow({ where: { id: fixtureData.instance.id } })).version).toBe(4);
  });
  it('returns the same audited transition for a retry and rejects altered replay', async () => {
    const { command, reviewer, projectId } = await fixture();
    const first = await workflow.transition(command, reviewer, randomUUID());
    const repeated = await workflow.transition(command, reviewer, randomUUID());
    expect(repeated.id).toBe(first.id);
    expect(await prisma.workflowTransition.count({ where: { projectId } })).toBe(1);
    await expect(workflow.transition({ ...command, comments: 'changed' }, reviewer, randomUUID())).rejects.toThrow('Idempotency');
    await expect(workflow.transition(command, { ...reviewer, subject: 'different-actor' }, randomUUID())).rejects.toThrow('Idempotency');
  });
  it('rejects wrong authority, external verifier mutations and another institution', async () => {
    const { command } = await fixture();
    await expect(workflow.transition(command, actor('DIRECTOR_GENERAL'), randomUUID())).rejects.toThrow('not authorized');
    await expect(workflow.transition(command, actor('PPA_VERIFIER'), randomUUID())).rejects.toThrow('read-only');
    await expect(workflow.transition(command, actor('MOF_VERIFIER'), randomUUID())).rejects.toThrow('read-only');
    await expect(workflow.transition(command, actor('TECHNICAL_WORKING_GROUP', 'unrelated'), randomUUID())).rejects.toThrow('no access');
  });
  it('rejects missing documents, failed conditions, failed validation and client-injected roles', async () => {
    const missing = await fixture(false);
    await expect(workflow.transition(missing.command, missing.reviewer, randomUUID())).rejects.toThrow('document');
    const present = await fixture();
    requirementsMet = false;
    await expect(workflow.transition(present.command, present.reviewer, randomUUID())).rejects.toThrow('condition');
    requirementsMet = true;
    evidenceValid = false;
    await expect(workflow.transition(present.command, present.reviewer, randomUUID())).rejects.toThrow('validation');
    await expect(workflow.transition({ ...present.command, authorizedRole: 'DIRECTOR_GENERAL' } as typeof present.command, present.reviewer, randomUUID())).rejects.toThrow('Invalid transition');
    expect(await prisma.workflowTransition.count({ where: { instanceId: present.instance.id } })).toBe(0);
  });
  it('rejects stale state/version/revision and changed previously reviewed evidence', async () => {
    const { command, reviewer, documentId } = await fixture();
    await expect(workflow.transition({ ...command, expectedVersion: 8 }, reviewer, randomUUID())).rejects.toThrow('changed');
    await expect(workflow.transition({ ...command, evidenceRevision: 2 }, reviewer, randomUUID())).rejects.toThrow('changed');
    await workflow.transition(command, reviewer, randomUUID());
    await prisma.documentVersion.create({ data: { documentId: documentId!, number: 2, objectKey: `test/${randomUUID()}`, checksum: 'synthetic-v2', createdBy: 'fixture' } });
    await expect(workflow.transition({ ...command, requestId: randomUUID(), currentState: 'ASSESSED', targetState: 'COMMITTEE_RECOMMENDED', expectedVersion: 1 }, actor('TECHNICAL_CLEARANCE_COMMITTEE'), randomUUID())).rejects.toThrow('evidence changed');
  });
  it('rolls back the state change if the shared audit append fails', async () => {
    const { instance, command, reviewer } = await fixture();
    jest.spyOn(audit, 'append').mockRejectedValueOnce(new Error('synthetic audit failure'));
    await expect(workflow.transition(command, reviewer, randomUUID())).rejects.toThrow('audit failure');
    const unchanged = await prisma.workflowInstance.findUniqueOrThrow({ where: { id: instance.id } });
    expect(unchanged.state).toBe('QUEUED');
    expect(unchanged.version).toBe(0);
    expect(await prisma.workflowTransition.count({ where: { instanceId: instance.id } })).toBe(0);
  });
  it('prevents concurrent duplicate transitions and permits an idempotent retry', async () => {
    const { command, reviewer } = await fixture();
    const results = await Promise.allSettled([workflow.transition(command, reviewer, randomUUID()), workflow.transition(command, reviewer, randomUUID())]);
    const completed = results.filter(result => result.status === 'fulfilled');
    expect(completed.length).toBeGreaterThanOrEqual(1);
    if (completed.length === 2) expect(completed[0]!.value.id).toBe(completed[1]!.value.id);
    const retry = await workflow.transition(command, reviewer, randomUUID());
    expect(retry.resultingVersion).toBe(1);
    expect(await prisma.workflowTransition.count({ where: { instanceId: command.instanceId } })).toBe(1);
  });
  it('enforces append-only audit, transition and evidence history in PostgreSQL', async () => {
    const { command, reviewer, projectId } = await fixture();
    const transition = await workflow.transition(command, reviewer, randomUUID());
    await expect(prisma.$executeRaw`UPDATE "AuditEvent" SET action = 'altered' WHERE id = ${transition.auditReference}::uuid`).rejects.toThrow('append-only');
    await expect(prisma.$executeRaw`DELETE FROM "WorkflowTransition" WHERE id = ${transition.id}::uuid`).rejects.toThrow('append-only');
    await expect(prisma.$executeRaw`UPDATE "Project" SET id = ${randomUUID()}::uuid WHERE id = ${projectId}::uuid`).rejects.toThrow('immutable');
  });
  it('enforces project foreign keys rather than allowing a second project master', async () => {
    await expect(prisma.workflowInstance.create({ data: { projectId: randomUUID(), kind: 'TECHNICAL_CLEARANCE', definitionKey: definition.key, definitionVersion: 1, state: 'QUEUED', createdBy: 'fixture', updatedBy: 'fixture' } })).rejects.toThrow();
  });
});
