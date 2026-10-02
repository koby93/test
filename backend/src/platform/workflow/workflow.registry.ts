import { Injectable } from '@nestjs/common';
import { ROLES, WORKFLOW_KINDS } from '@nita/contracts';
import { validateGovernedRule } from './governance';
import { WorkflowDefinition, WorkflowResolver } from './workflow.types';

function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const item of Object.values(value)) freeze(item);
  }
  return value;
}
@Injectable()
export class WorkflowRegistry {
  private readonly definitions = new Map<string, WorkflowDefinition>();
  private readonly conditions = new Map<string, WorkflowResolver>();
  private readonly validators = new Map<string, WorkflowResolver>();
  registerCondition(key: string, resolver: WorkflowResolver) {
    if (!key || this.conditions.has(key)) throw new Error('Duplicate or invalid condition registration.');
    this.conditions.set(key, resolver);
  }
  registerValidator(key: string, resolver: WorkflowResolver) {
    if (!key || this.validators.has(key)) throw new Error('Duplicate or invalid validator registration.');
    this.validators.set(key, resolver);
  }
  registerDefinition(definition: WorkflowDefinition) {
    const identity = `${definition.key}@${definition.version}`;
    if (!definition.key || !Number.isInteger(definition.version) || definition.version < 1 || this.definitions.has(identity)) throw new Error('Duplicate or invalid workflow definition.');
    if (!WORKFLOW_KINDS.includes(definition.kind) || !definition.states.includes(definition.initialState) || new Set(definition.states).size !== definition.states.length || !definition.initialRoles.length || !definition.transitions.length) throw new Error('Invalid workflow states or initial authority.');
    const pairs = new Set<string>();
    for (const role of definition.initialRoles) this.assertRole(role);
    for (const rule of definition.transitions) {
      const pair = `${rule.currentState}->${rule.targetState}`;
      if (pairs.has(pair) || rule.currentState === rule.targetState || !definition.states.includes(rule.currentState) || !definition.states.includes(rule.targetState) || !rule.authorizedRoles.length) throw new Error('Invalid or ambiguous workflow transition.');
      pairs.add(pair);
      rule.authorizedRoles.forEach(role => this.assertRole(role));
      rule.requiredConditions.forEach(key => { if (!this.conditions.has(key)) throw new Error('Unregistered workflow condition.'); });
      rule.validators.forEach(key => { if (!this.validators.has(key)) throw new Error('Unregistered workflow validator.'); });
      rule.requiredDocuments.forEach(doc => { if (!doc.type || !Number.isInteger(doc.minimumVersion) || doc.minimumVersion < 1) throw new Error('Invalid document requirement.'); });
      validateGovernedRule(definition.kind, rule);
    }
    this.definitions.set(identity, freeze(structuredClone(definition)));
  }
  get(key: string, version: number): WorkflowDefinition {
    const definition = this.definitions.get(`${key}@${version}`);
    if (!definition) throw new Error('Workflow definition is not registered.');
    return definition;
  }
  condition(key: string): WorkflowResolver {
    const resolver = this.conditions.get(key);
    if (!resolver) throw new Error('Workflow condition is not registered.');
    return resolver;
  }
  validator(key: string): WorkflowResolver {
    const resolver = this.validators.get(key);
    if (!resolver) throw new Error('Workflow validator is not registered.');
    return resolver;
  }
  private assertRole(role: string) {
    if (!(ROLES as readonly string[]).includes(role) || ['PPA_VERIFIER', 'MOF_VERIFIER'].includes(role)) throw new Error('Invalid workflow mutation authority.');
  }
}
