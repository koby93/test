import { BadRequestException, ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuthorizationService } from '../auth/authorization.service';
import { AuthenticatedActor } from '../http/request-context';
import { WorkflowRegistry } from './workflow.registry';
import { assertReviewSequence } from './governance';
import { EvidenceDocument, WorkflowContext } from './workflow.types';
import { TransitionCommand } from './transition.dto';

@Injectable()
export class WorkflowService {
  constructor(private readonly prisma: PrismaService, private readonly registry: WorkflowRegistry,
    private readonly authorization: AuthorizationService, private readonly audit: AuditService) {}

  async createInstance(projectId: string, definitionKey: string, definitionVersion: number, actor: AuthenticatedActor, correlationId: string) {
    const definition = this.registry.get(definitionKey, definitionVersion);
    return this.prisma.$transaction(async tx => {
      const project = await tx.project.findUnique({ where: { id: projectId } });
      if (!project) throw new NotFoundException('Project not found.');
      this.authorization.assertProjectAccess(actor, project);
      const role = this.authorization.assertMutationRole(actor, definition.initialRoles);
      const instance = await tx.workflowInstance.create({ data: { projectId, kind: definition.kind, definitionKey, definitionVersion, state: definition.initialState, createdBy: actor.subject, updatedBy: actor.subject } });
      await this.audit.append(tx, { projectId, actorId: actor.subject, actorRole: role, institutionId: actor.institutionId, action: 'WORKFLOW_CREATED', subjectType: 'WorkflowInstance', subjectId: instance.id, correlationId, result: 'SUCCESS', payload: { definitionKey, definitionVersion, initialState: definition.initialState } });
      return instance;
    });
  }

  async transition(input: TransitionCommand, actor: AuthenticatedActor, correlationId: string) {
    const command = plainToInstance(TransitionCommand, input);
    if (validateSync(command, { whitelist: true, forbidNonWhitelisted: true }).length) throw new BadRequestException('Invalid transition command.');
    try {
      return await this.prisma.$transaction(async tx => {
        const instance = await tx.workflowInstance.findUnique({ where: { id: command.instanceId }, include: { project: true } });
        if (!instance) throw new NotFoundException('Workflow instance not found.');
        this.authorization.assertProjectAccess(actor, instance.project);
        const definition = this.registry.get(instance.definitionKey, instance.definitionVersion);
        if (definition.kind !== instance.kind) throw new ConflictException('Workflow definition does not match the stored instance.');
        const rule = definition.transitions.find(candidate => candidate.currentState === command.currentState && candidate.targetState === command.targetState);
        if (!rule) throw new ConflictException('The requested transition is not allowed.');
        const role = this.authorization.assertMutationRole(actor, rule.authorizedRoles);
        const existing = await tx.workflowTransition.findUnique({ where: { instanceId_requestId: { instanceId: instance.id, requestId: command.requestId } } });
        if (existing) {
          if (existing.actorId !== actor.subject || existing.currentState !== command.currentState || existing.targetState !== command.targetState || existing.expectedVersion !== command.expectedVersion || existing.evidenceRevision !== command.evidenceRevision || existing.comments !== command.comments || existing.authorizedRole !== role) throw new ConflictException('Idempotency key was used with a different command or actor.');
          return existing;
        }
        if (instance.state !== command.currentState || instance.version !== command.expectedVersion || instance.evidenceRevision !== command.evidenceRevision) throw new ConflictException('The workflow or evidence revision changed; reload before reviewing.');
        const history = await tx.workflowTransition.findMany({ where: { instanceId: instance.id, evidenceRevision: instance.evidenceRevision }, include: { evidence: { include: { documentVersion: true } } } });
        assertReviewSequence(definition.kind, rule, history, instance.evidenceRevision);
        const records = await tx.document.findMany({ where: { projectId: instance.projectId }, include: { versions: { orderBy: { number: 'desc' }, take: 1 } } });
        const documents: EvidenceDocument[] = records.flatMap(document => document.versions.map(version => ({ id: version.id, documentId: document.id, type: document.type, number: version.number, checksum: version.checksum })));
        for (const previous of history) {
          for (const evidence of previous.evidence) {
            const current = documents.find(document => document.documentId === evidence.documentVersion.documentId);
            if (!current || current.id !== evidence.documentVersionId) throw new ConflictException('Reviewed document evidence changed; an affected review cycle is required.');
          }
        }
        const selected = rule.requiredDocuments.map(required => {
          const document = documents.find(candidate => candidate.type === required.type && candidate.number >= required.minimumVersion);
          if (!document) throw new UnprocessableEntityException('Required document evidence is missing or outdated.');
          return document;
        });
        const context: WorkflowContext = { transaction: tx, projectId: instance.projectId, instanceId: instance.id, actor, currentState: instance.state, targetState: command.targetState, evidenceRevision: instance.evidenceRevision, documents: selected };
        const checks: Record<string, { passed: boolean; code: string }> = {};
        for (const key of rule.requiredConditions) {
          checks[`condition:${key}`] = await this.registry.condition(key)(context);
          if (checks[`condition:${key}`]?.passed !== true) throw new UnprocessableEntityException('A required workflow condition is not satisfied.');
        }
        for (const key of rule.validators) {
          checks[`validator:${key}`] = await this.registry.validator(key)(context);
          if (checks[`validator:${key}`]?.passed !== true) throw new UnprocessableEntityException('Workflow validation did not pass.');
        }
        const updated = await tx.workflowInstance.updateMany({
          where: { id: instance.id, state: command.currentState, version: command.expectedVersion, evidenceRevision: command.evidenceRevision },
          data: { state: command.targetState, version: { increment: 1 }, updatedBy: actor.subject },
        });
        if (updated.count !== 1) throw new ConflictException('Concurrent workflow change detected.');
        const timestamp = new Date();
        const transitionId = randomUUID();
        const validation = { state: true, role: true, projectScope: true, reviewSequence: true, evidenceRevision: instance.evidenceRevision, checks, evidence: selected } as unknown as Prisma.InputJsonValue;
        const audit = await this.audit.append(tx, {
          projectId: instance.projectId, actorId: actor.subject, actorRole: role, institutionId: actor.institutionId,
          action: 'WORKFLOW_TRANSITION', subjectType: 'WorkflowTransition', subjectId: transitionId, correlationId, result: 'SUCCESS', timestamp,
          payload: { instanceId: instance.id, currentState: command.currentState, targetState: command.targetState, definitionKey: definition.key, definitionVersion: definition.version, evidenceRevision: instance.evidenceRevision, requestId: command.requestId },
        });
        return tx.workflowTransition.create({ data: {
          id: transitionId, instanceId: instance.id, projectId: instance.projectId, requestId: command.requestId,
          currentState: command.currentState, targetState: command.targetState, authorizedRole: role, stage: rule.stage,
          requiredConditions: [...rule.requiredConditions], requiredDocuments: structuredClone(rule.requiredDocuments) as unknown as Prisma.InputJsonValue,
          validation, actorId: actor.subject, institutionId: actor.institutionId, timestamp, comments: command.comments,
          auditReference: audit.id, evidenceRevision: instance.evidenceRevision, expectedVersion: command.expectedVersion, resultingVersion: command.expectedVersion + 1,
          evidence: { create: [...new Set(selected.map(document => document.id))].map(documentVersionId => ({ documentVersionId })) },
        } });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 10000 });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2034'].includes(error.code)) throw new ConflictException('Concurrent workflow change detected; retry with the same idempotency key.');
      throw error;
    }
  }
}
