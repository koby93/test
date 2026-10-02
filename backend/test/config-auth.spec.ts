import { ForbiddenException } from '@nestjs/common';
import { validateEnvironment } from '../src/platform/config/environment';
import { AuthorizationService } from '../src/platform/auth/authorization.service';
import { actor, testEnvironment } from './helpers';
describe('Validated configuration', () => {
  it('loads typed development defaults and disabled empty OIDC options', () => {
    const env = validateEnvironment({ ...testEnvironment, OIDC_ISSUER_URL: '', OIDC_JWKS_URI: '', OIDC_AUDIENCE: '' });
    expect(env.PORT).toBe(4000);
    expect(env.OIDC_ENABLED).toBe(false);
    expect(env.OIDC_ISSUER_URL).toBeUndefined();
  });
  it('rejects missing infrastructure configuration without revealing provided secrets', () => {
    expect(() => validateEnvironment({ ...testEnvironment, DATABASE_URL: 'credential-value' })).toThrow('PostgreSQL');
    try { validateEnvironment({ ...testEnvironment, DATABASE_URL: 'credential-value' }); } catch (error) { expect(String(error)).not.toContain('credential-value'); }
  });
  it('requires full OIDC configuration and prevents MFA without OIDC', () => {
    expect(() => validateEnvironment({ ...testEnvironment, OIDC_ENABLED: 'true' })).toThrow('OIDC enabled');
    expect(() => validateEnvironment({ ...testEnvironment, OIDC_REQUIRE_MFA: 'true' })).toThrow('MFA requires');
    expect(() => validateEnvironment({ ...testEnvironment, NODE_ENV: 'production' })).toThrow('Production requires');
  });
});
describe('Shared authorization', () => {
  const service = new AuthorizationService();
  it.each(['PPA_VERIFIER', 'MOF_VERIFIER'] as const)('rejects %s business mutations', role => {
    expect(() => service.assertMutationRole(actor(role), [role])).toThrow('read-only');
  });
  it('does not turn platform administration into final decision authority', () => {
    expect(() => service.assertMutationRole(actor('PLATFORM_ADMIN'), ['DIRECTOR_GENERAL'])).toThrow(ForbiddenException);
  });
  it('requires institution ownership or a trusted explicit project assignment', () => {
    const project = { id: 'project-test', institutionId: 'other-institution' };
    expect(() => service.assertProjectAccess(actor(), project)).toThrow(ForbiddenException);
    expect(() => service.assertProjectAccess({ ...actor(), projectIds: ['project-test'] }, project)).not.toThrow();
  });
});
