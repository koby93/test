import type { Role, WorkflowKind } from '@nita/contracts';
import type { AuthenticatedActor } from '../http/request-context';
import type { Prisma } from '@prisma/client';
export type ReviewStage = 'ASSESSMENT' | 'FIRST_RECOMMENDATION' | 'SECOND_RECOMMENDATION' | 'FINAL_DECISION' | 'IMPLEMENTATION' | 'ISSUANCE';
export interface DocumentRequirement { type: string; minimumVersion: number }
export interface WorkflowRule {
  currentState: string;
  targetState: string;
  authorizedRoles: readonly Role[];
  stage: ReviewStage;
  requiredConditions: readonly string[];
  requiredDocuments: readonly DocumentRequirement[];
  validators: readonly string[];
}
export interface WorkflowDefinition {
  key: string;
  version: number;
  kind: WorkflowKind;
  states: readonly string[];
  initialState: string;
  initialRoles: readonly Role[];
  transitions: readonly WorkflowRule[];
}
export interface EvidenceDocument { id: string; documentId: string; type: string; number: number; checksum: string }
export interface WorkflowContext {
  /** Conditions/validators must read authoritative records in this same transaction. */
  transaction: Prisma.TransactionClient;
  projectId: string;
  instanceId: string;
  actor: AuthenticatedActor;
  currentState: string;
  targetState: string;
  evidenceRevision: number;
  documents: readonly EvidenceDocument[];
}
export interface ValidationResult { passed: boolean; code: string }
export type WorkflowResolver = (context: WorkflowContext) => Promise<ValidationResult>;
export interface ReviewReceipt { stage: string; authorizedRole: string; evidenceRevision: number }
