import { Request } from 'express';
import type { Role } from '@nita/contracts';
export interface AuthenticatedActor {
  subject: string;
  institutionId: string;
  roles: readonly Role[];
  projectIds: readonly string[];
  amr: readonly string[];
  acr?: string;
}
export interface PlatformRequest extends Request {
  correlationId: string;
  actor?: AuthenticatedActor;
}
