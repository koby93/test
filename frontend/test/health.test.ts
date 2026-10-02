import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPlatformHealth, parseHealth } from '../src/lib/health';
const ready = { status: 'ok', timestamp: new Date().toISOString(), checks: { database: 'up', redis: 'up', storage: 'up' } };
afterEach(() => vi.unstubAllGlobals());
describe('Live platform health', () => {
  it('accepts a consistent ready response', () => expect(parseHealth(ready)).toEqual(ready));
  it('rejects malformed and contradictory health data', () => {
    expect(parseHealth({ ...ready, checks: { database: 'down', redis: 'up', storage: 'up' } })).toBeUndefined();
    expect(parseHealth({ ...ready, timestamp: 'invalid' })).toBeUndefined();
    expect(parseHealth({ checks: {} })).toBeUndefined();
  });
  it('reports a failing dependency from a 503 response', async () => {
    const degraded = { ...ready, status: 'degraded', checks: { ...ready.checks, storage: 'down' } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 503, json: async () => degraded }));
    expect(await getPlatformHealth()).toEqual(degraded);
  });
  it('does not claim operational dependencies when the API is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('unreachable')));
    expect((await getPlatformHealth()).status).toBe('unavailable');
  });
  it('rejects an HTTP status that contradicts the body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 503, json: async () => ready }));
    expect((await getPlatformHealth()).status).toBe('unavailable');
  });
});
