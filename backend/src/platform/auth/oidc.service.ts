import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { ROLES, Role } from '@nita/contracts';
import { AuthenticatedActor } from '../http/request-context';

@Injectable()
export class OidcService {
  private readonly keys?: ReturnType<typeof createRemoteJWKSet>;
  constructor(private readonly config: ConfigService) {
    if (config.get<boolean>('OIDC_ENABLED')) {
      this.keys = createRemoteJWKSet(new URL(config.getOrThrow<string>('OIDC_JWKS_URI')), { timeoutDuration: 3000, cooldownDuration: 1000 });
    }
  }
  async authenticate(authorization?: string): Promise<AuthenticatedActor> {
    if (!this.keys || !authorization?.startsWith('Bearer ')) throw new UnauthorizedException('Authentication is required.');
    try {
      const { payload } = await jwtVerify(authorization.slice(7), this.keys, {
        issuer: this.config.getOrThrow<string>('OIDC_ISSUER_URL'), audience: this.config.getOrThrow<string>('OIDC_AUDIENCE'),
        algorithms: ['RS256', 'ES256'], requiredClaims: ['sub', 'exp', 'iat'], clockTolerance: 5,
      });
      if (!payload.sub || typeof payload.institution_id !== 'string' || !payload.institution_id) throw new Error('Missing actor scope');
      const realm = payload.realm_access as { roles?: unknown } | undefined;
      const claims = Array.isArray(realm?.roles) ? realm.roles : [];
      const roles = claims.filter((role): role is Role => typeof role === 'string' && (ROLES as readonly string[]).includes(role));
      const amr = Array.isArray(payload.amr) ? payload.amr.filter((item): item is string => typeof item === 'string') : [];
      const acr = typeof payload.acr === 'string' ? payload.acr : undefined;
      if (this.config.get<boolean>('OIDC_REQUIRE_MFA')) {
        const requiredAcr = this.config.get<string>('OIDC_MFA_ACR');
        if (!amr.includes('mfa') || (requiredAcr && acr !== requiredAcr)) throw new Error('MFA assurance missing');
      }
      return {
        subject: payload.sub, institutionId: payload.institution_id, roles, amr, acr,
        projectIds: Array.isArray(payload.project_ids) ? payload.project_ids.filter((item): item is string => typeof item === 'string') : [],
      };
    } catch { throw new UnauthorizedException('The access token is invalid or lacks required assurance.'); }
  }
}
