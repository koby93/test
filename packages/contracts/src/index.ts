/** Identifiers are shared contracts. Only the future project registry allocates Project IDs. */
export type ProjectId = string & { readonly __projectId: unique symbol };
export type WorkflowKind = 'TECHNICAL_CLEARANCE' | 'PROJECT_IMPLEMENTATION' | 'UAT_CONFORMITY' | 'CERTIFICATION';
export const WORKFLOW_KINDS: readonly WorkflowKind[] = ['TECHNICAL_CLEARANCE', 'PROJECT_IMPLEMENTATION', 'UAT_CONFORMITY', 'CERTIFICATION'];
export const ROLES = ['MDA_USER', 'TECHNICAL_WORKING_GROUP', 'TECHNICAL_CLEARANCE_COMMITTEE', 'DIRECTOR_TECHNICAL_SERVICES', 'DIRECTOR_GENERAL', 'TECHNICAL_ASSESSMENT_UAT_TEAM', 'CERTIFICATION_UNIT', 'PPA_VERIFIER', 'MOF_VERIFIER', 'PLATFORM_ADMIN'] as const;
export type Role = typeof ROLES[number];
export interface AuditFields {
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}
export interface PlatformHealth {
  status: 'ok' | 'degraded' | 'unavailable';
  timestamp: string;
  checks: { database: 'up' | 'down'; redis: 'up' | 'down'; storage: 'up' | 'down' };
}
export interface ApiError {
  statusCode: number;
  error: { code: string; message: string; details?: unknown };
  correlationId: string;
  timestamp: string;
  path: string;
}
