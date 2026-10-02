import { assertReviewSequence, validateGovernedRule } from '../src/platform/workflow/governance';
import { WorkflowRegistry } from '../src/platform/workflow/workflow.registry';
import { ReviewReceipt, WorkflowRule } from '../src/platform/workflow/workflow.types';
import { reviewDefinition } from './helpers';
describe.each(['TECHNICAL_CLEARANCE', 'UAT_CONFORMITY'] as const)('%s governance', kind => {
  const definition = reviewDefinition(kind);
  it('permits the ordered assessment, committee, Director and Director-General sequence', () => {
    const history: ReviewReceipt[] = [];
    for (const rule of definition.transitions) {
      expect(() => validateGovernedRule(kind, rule)).not.toThrow();
      expect(() => assertReviewSequence(kind, rule, history, 1)).not.toThrow();
      history.push({ stage: rule.stage, authorizedRole: rule.authorizedRoles[0]!, evidenceRevision: 1 });
    }
  });
  it('rejects skipped recommendations and prior receipts from another evidence revision', () => {
    const final = definition.transitions[3]!;
    expect(() => assertReviewSequence(kind, final, [], 1)).toThrow('prior review');
    const stale = definition.transitions.slice(0, 3).map(rule => ({ stage: rule.stage, authorizedRole: rule.authorizedRoles[0]!, evidenceRevision: 1 }));
    expect(() => assertReviewSequence(kind, final, stale, 2)).toThrow('prior review');
  });
  it('rejects a committee final decision and repeats outside idempotent replay', () => {
    expect(() => validateGovernedRule(kind, { ...definition.transitions[3]!, authorizedRoles: ['TECHNICAL_CLEARANCE_COMMITTEE'] })).toThrow('authority');
    const rule = definition.transitions[0]!;
    expect(() => assertReviewSequence(kind, rule, [{ stage: rule.stage, authorizedRole: rule.authorizedRoles[0]!, evidenceRevision: 1 }], 1)).toThrow('already');
  });
});
describe('Reusable definition registry', () => {
  const configured = () => {
    const registry = new WorkflowRegistry();
    registry.registerCondition('test.requirementsMet', async () => ({ passed: true, code: 'MET' }));
    registry.registerValidator('test.evidenceValid', async () => ({ passed: true, code: 'VALID' }));
    return registry;
  };
  it('pins and freezes each workflow definition version', () => {
    const registry = configured();
    const definition = reviewDefinition();
    registry.registerDefinition(definition);
    (definition.transitions[0]!.authorizedRoles as string[])[0] = 'DIRECTOR_GENERAL';
    expect(registry.get(definition.key, 1).transitions[0]!.authorizedRoles).toEqual(['TECHNICAL_WORKING_GROUP']);
    expect(Object.isFrozen(registry.get(definition.key, 1))).toBe(true);
    expect(() => registry.registerDefinition(reviewDefinition())).toThrow('Duplicate');
  });
  it('fails closed on missing conditions, validators and external mutation roles', () => {
    expect(() => new WorkflowRegistry().registerDefinition(reviewDefinition())).toThrow('Unregistered');
    const definition = reviewDefinition();
    expect(() => configured().registerDefinition({ ...definition, initialRoles: ['PPA_VERIFIER'] })).toThrow('authority');
  });
  it('requires eligible clearance for implementation and eligible conformity for issuance', () => {
    const common = { currentState: 'PENDING', targetState: 'DONE', requiredDocuments: [], validators: [] };
    const implementation: WorkflowRule = { ...common, stage: 'IMPLEMENTATION', authorizedRoles: ['MDA_USER'], requiredConditions: [] };
    const issuance: WorkflowRule = { ...common, stage: 'ISSUANCE', authorizedRoles: ['CERTIFICATION_UNIT'], requiredConditions: [] };
    expect(() => validateGovernedRule('PROJECT_IMPLEMENTATION', implementation)).toThrow('clearance');
    expect(() => validateGovernedRule('CERTIFICATION', issuance)).toThrow('conformity');
    expect(() => validateGovernedRule('PROJECT_IMPLEMENTATION', { ...implementation, requiredConditions: ['clearance.permitsImplementation'] })).not.toThrow();
    expect(() => validateGovernedRule('CERTIFICATION', { ...issuance, requiredConditions: ['conformity.permitsIssuance'] })).not.toThrow();
    expect(() => validateGovernedRule('CERTIFICATION', { ...issuance, authorizedRoles: ['DIRECTOR_GENERAL'], requiredConditions: ['conformity.permitsIssuance'] })).toThrow();
  });
});
