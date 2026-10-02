import { ConflictException } from '@nestjs/common';
import type { Role, WorkflowKind } from '@nita/contracts';
import { ReviewReceipt, ReviewStage, WorkflowRule } from './workflow.types';

const stages: readonly ReviewStage[] = ['ASSESSMENT', 'FIRST_RECOMMENDATION', 'SECOND_RECOMMENDATION', 'FINAL_DECISION'];
const roles: Partial<Record<WorkflowKind, readonly Role[]>> = {
  TECHNICAL_CLEARANCE: ['TECHNICAL_WORKING_GROUP', 'TECHNICAL_CLEARANCE_COMMITTEE', 'DIRECTOR_TECHNICAL_SERVICES', 'DIRECTOR_GENERAL'],
  UAT_CONFORMITY: ['TECHNICAL_ASSESSMENT_UAT_TEAM', 'TECHNICAL_CLEARANCE_COMMITTEE', 'DIRECTOR_TECHNICAL_SERVICES', 'DIRECTOR_GENERAL'],
};
/** Global policy lives here, never in controllers or later module-specific shortcuts. */
export function validateGovernedRule(kind: WorkflowKind, rule: WorkflowRule): void {
  const sequence = roles[kind];
  if (sequence) {
    const index = stages.indexOf(rule.stage);
    if (index < 0 || rule.authorizedRoles.length !== 1 || rule.authorizedRoles[0] !== sequence[index]) {
      throw new Error('Rule contradicts the approved review authority.');
    }
  } else if (kind === 'CERTIFICATION') {
    if (rule.stage !== 'ISSUANCE' || rule.authorizedRoles.length !== 1 || rule.authorizedRoles[0] !== 'CERTIFICATION_UNIT' || !rule.requiredConditions.includes('conformity.permitsIssuance')) {
      throw new Error('Certification requires Certification Unit authority and an eligible final conformity decision.');
    }
  } else if (kind === 'PROJECT_IMPLEMENTATION') {
    if (rule.stage !== 'IMPLEMENTATION' || !rule.requiredConditions.includes('clearance.permitsImplementation')) {
      throw new Error('Implementation requires clearance eligibility.');
    }
  }
}
export function assertReviewSequence(kind: WorkflowKind, rule: WorkflowRule, history: readonly ReviewReceipt[], evidenceRevision: number): void {
  const sequence = roles[kind];
  if (!sequence) return;
  const index = stages.indexOf(rule.stage);
  const current = history.filter(receipt => receipt.evidenceRevision === evidenceRevision);
  for (let prior = 0; prior < index; prior++) {
    if (!current.some(receipt => receipt.stage === stages[prior] && receipt.authorizedRole === sequence[prior])) {
      throw new ConflictException('Required prior review/recommendation is incomplete for this evidence revision.');
    }
  }
  if (current.some(receipt => stages.indexOf(receipt.stage as ReviewStage) >= index)) {
    throw new ConflictException('This review stage has already been completed for this evidence revision.');
  }
}
