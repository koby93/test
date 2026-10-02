import { ConfigService } from '@nestjs/config';
import { createServer, Server } from 'node:http';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { OidcService } from '../src/platform/auth/oidc.service';
describe('OIDC and MFA-ready authentication', () => {
  let server: Server;
  let issuer: string;
  let keys: Awaited<ReturnType<typeof generateKeyPair>>;
  let service: OidcService;
  const token = async (overrides: Record<string, unknown> = {}, audience = 'nita-test-api') => new SignJWT({ institution_id: 'institution-test', realm_access: { roles: ['DIRECTOR_GENERAL', 'unknown-role'] }, project_ids: ['project-test'], amr: ['mfa'], ...overrides }).setProtectedHeader({ alg: 'RS256', kid: 'test-key' }).setSubject('test-subject').setIssuer(issuer).setAudience(audience).setIssuedAt().setExpirationTime('5m').sign(keys.privateKey);
  beforeAll(async () => {
    keys = await generateKeyPair('RS256');
    const jwk = await exportJWK(keys.publicKey);
    server = createServer((_req, res) => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ keys: [{ ...jwk, kid: 'test-key', alg: 'RS256', use: 'sig' }] })); });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test JWKS server failed');
    issuer = `http://127.0.0.1:${address.port}`;
    service = new OidcService(new ConfigService({ OIDC_ENABLED: true, OIDC_JWKS_URI: issuer, OIDC_ISSUER_URL: issuer, OIDC_AUDIENCE: 'nita-test-api', OIDC_REQUIRE_MFA: true }));
  });
  afterAll(async () => { await new Promise<void>(resolve => server.close(() => resolve())); });
  it('verifies signature, issuer, audience and trusted Keycloak-style role/scope claims', async () => {
    const actor = await service.authenticate(`Bearer ${await token()}`);
    expect(actor.subject).toBe('test-subject');
    expect(actor.roles).toEqual(['DIRECTOR_GENERAL']);
    expect(actor.projectIds).toEqual(['project-test']);
  });
  it('rejects invalid audience, absent institution scope and missing MFA assurance', async () => {
    await expect(service.authenticate(`Bearer ${await token({}, 'wrong-audience')}`)).rejects.toThrow('invalid');
    await expect(service.authenticate(`Bearer ${await token({ institution_id: null })}`)).rejects.toThrow('invalid');
    await expect(service.authenticate(`Bearer ${await token({ amr: ['pwd'] })}`)).rejects.toThrow('assurance');
  });
  it('rejects an unsigned/untrusted token and an expired token', async () => {
    await expect(service.authenticate('Bearer untrusted')).rejects.toThrow('invalid');
    const expired = await new SignJWT({ institution_id: 'institution-test', amr: ['mfa'] }).setProtectedHeader({ alg: 'RS256', kid: 'test-key' }).setSubject('test-subject').setIssuer(issuer).setAudience('nita-test-api').setIssuedAt(1).setExpirationTime(2).sign(keys.privateKey);
    await expect(service.authenticate(`Bearer ${expired}`)).rejects.toThrow('invalid');
  });
});
