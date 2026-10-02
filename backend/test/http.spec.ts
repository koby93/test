import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { configureApplication } from '../src/configure-application';
import { Public } from '../src/platform/auth/auth.decorators';
import { PrismaService } from '../src/platform/database/prisma.service';
import { RedisService } from '../src/platform/cache/redis.service';
import { StorageService } from '../src/platform/storage/storage.service';
import { testEnvironment } from './helpers';

@Controller({ path: 'test-only', version: '1' })
class TestOnlyController {
  @Get('private') privateRoute() { return { ok: true }; }
  @Public() @Get('failure') failure() { throw new Error('database password must never appear in a response'); }
}
describe('Versioned platform HTTP boundary', () => {
  let app: INestApplication;
  const storage = { ping: jest.fn().mockResolvedValue(undefined) };
  beforeAll(async () => {
    Object.assign(process.env, testEnvironment);
    const { AppModule } = await import('../src/app.module');
    const module = await Test.createTestingModule({ imports: [AppModule], controllers: [TestOnlyController] })
      .overrideProvider(PrismaService).useValue({ ping: jest.fn().mockResolvedValue(undefined) })
      .overrideProvider(RedisService).useValue({ ping: jest.fn().mockResolvedValue('PONG') })
      .overrideProvider(StorageService).useValue(storage).compile();
    app = configureApplication(module.createNestApplication());
    await app.init();
  });
  afterAll(async () => { await app?.close(); });
  it('serves only the versioned API and publishes real OpenAPI paths', async () => {
    await request(app.getHttpServer()).get('/api/v1/health/live').expect(200);
    await request(app.getHttpServer()).get('/api/v2/health/live').expect(404);
    const document = await request(app.getHttpServer()).get('/api/v1/openapi.json').expect(200);
    expect(document.body.paths['/api/v1/health/ready']).toBeDefined();
  });
  it('validates invalid values and unexpected query properties centrally', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/platform?detail=invalid').expect(400);
    expect(response.body.error.message).toBe('Request validation failed.');
    expect(response.body.correlationId).toBeTruthy();
    await request(app.getHttpServer()).get('/api/v1/platform?extra=invalid').expect(400);
  });
  it('defaults protected routes to denied when no identity provider is configured', async () => {
    await request(app.getHttpServer()).get('/api/v1/test-only/private').expect(401);
    await request(app.getHttpServer()).get('/api/v1/test-only/private').set('Authorization', 'Bearer unverified').expect(401);
  });
  it('separates readiness failures from process liveness', async () => {
    storage.ping.mockRejectedValueOnce(new Error('unavailable'));
    const response = await request(app.getHttpServer()).get('/api/v1/health/ready').expect(503);
    expect(response.body.checks.storage).toBe('down');
    await request(app.getHttpServer()).get('/api/v1/health/live').expect(200);
    await request(app.getHttpServer()).get('/api/v1/health/ready').expect(200);
  });
  it('redacts internal failures and replaces unsafe correlation headers', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/test-only/failure').set('X-Correlation-ID', 'untrusted-value').expect(500);
    expect(JSON.stringify(response.body)).not.toContain('password');
    expect(response.headers['x-correlation-id']).not.toBe('untrusted-value');
    expect(response.body.correlationId).toBe(response.headers['x-correlation-id']);
  });
});
