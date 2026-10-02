import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@nita/contracts';
import { AuthenticatedActor } from '../http/request-context';
@Injectable()
export class AuthorizationService {
  assertProjectAccess(actor: AuthenticatedActor, project: { id: string; institutionId: string }) {
    if (!actor.subject || !actor.institutionId || (actor.institutionId !== project.institutionId && !actor.projectIds.includes(project.id))) {
      throw new ForbiddenException('The actor has no access to this project.');
    }
  }
  assertMutationRole(actor: AuthenticatedActor, allowed: readonly Role[]): Role {
    if (actor.roles.includes('PPA_VERIFIER') || actor.roles.includes('MOF_VERIFIER')) throw new ForbiddenException('External verification is read-only.');
    const role = allowed.find(candidate => actor.roles.includes(candidate));
    if (!role) throw new ForbiddenException('The actor is not authorized for this transition.');
    return role;
  }
}
