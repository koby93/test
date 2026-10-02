import { Role } from '@nita/contracts';
import { AuthenticatedActor } from '../src/platform/http/request-context';
import { WorkflowDefinition } from '../src/platform/workflow/workflow.types';
export const testEnvironment = {
  NODE_ENV: 'test', DATABASE_URL: 'postgresql://nita:development-only-database@localhost:5432/nita',
  REDIS_URL: 'redis://:development-only-cache@localhost:6379', S3_ENDPOINT: 'http://localhost:9000',
  S3_REGION: 'us-east-1', S3_ACCESS_KEY: 'nita-development', S3_SECRET_KEY: 'development-only-storage',
  S3_BUCKET: 'nita-records', LOG_LEVEL: 'silent', OIDC_ENABLED: 'false', OIDC_REQUIRE_MFA: 'false',
};
export function actor(role: Role = 'TECHNICAL_WORKING_GROUP', institutionId = 'institution-test', subject = 'synthetic-actor'): AuthenticatedActor {
  return { subject, institutionId, roles: [role], projectIds: [], amr: [] };
}
/** Synthetic service fixtures only. No production business workflows are registered. */
export function reviewDefinition(kind: 'TECHNICAL_CLEARANCE' | 'UAT_CONFORMITY' = 'TECHNICAL_CLEARANCE'): WorkflowDefinition {
  const states = ['QUEUED', 'ASSESSED', 'COMMITTEE_RECOMMENDED', 'DIRECTOR_RECOMMENDED', 'DECIDED'];
  const authorities: Role[] = [kind === 'TECHNICAL_CLEARANCE' ? 'TECHNICAL_WORKING_GROUP' : 'TECHNICAL_ASSESSMENT_UAT_TEAM', 'TECHNICAL_CLEARANCE_COMMITTEE', 'DIRECTOR_TECHNICAL_SERVICES', 'DIRECTOR_GENERAL'];
  const stages = ['ASSESSMENT', 'FIRST_RECOMMENDATION', 'SECOND_RECOMMENDATION', 'FINAL_DECISION'] as const;
  return {
    key: `test.${kind.toLowerCase()}`, version: 1, kind, states, initialState: 'QUEUED', initialRoles: ['MDA_USER'],
    transitions: stages.map((stage, index) => ({
      currentState: states[index]!, targetState: states[index + 1]!, authorizedRoles: [authorities[index]!], stage,
      requiredConditions: ['test.requirementsMet'], requiredDocuments: [{ type: 'TEST_REPORT', minimumVersion: 1 }], validators: ['test.evidenceValid'],
    })),
  };
}
