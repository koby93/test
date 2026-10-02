import type { PlatformHealth } from '@nita/contracts';
export function parseHealth(value: unknown): PlatformHealth | undefined {
  if (!value || typeof value !== 'object') return;
  const candidate = value as Record<string, unknown>;
  const checks = candidate.checks as Record<string, unknown> | undefined;
  if (!checks || !['ok', 'degraded'].includes(String(candidate.status)) || typeof candidate.timestamp !== 'string' || Number.isNaN(Date.parse(candidate.timestamp))) return;
  if (![checks.database, checks.redis, checks.storage].every(check => check === 'up' || check === 'down')) return;
  if ((candidate.status === 'ok') !== Object.values(checks).every(check => check === 'up')) return;
  return { status: candidate.status as 'ok' | 'degraded', timestamp: candidate.timestamp, checks: { database: checks.database as 'up' | 'down', redis: checks.redis as 'up' | 'down', storage: checks.storage as 'up' | 'down' } };
}
export async function getPlatformHealth(): Promise<PlatformHealth> {
  const unavailable: PlatformHealth = { status: 'unavailable', timestamp: new Date().toISOString(), checks: { database: 'down', redis: 'down', storage: 'down' } };
  try {
    const origin = process.env.API_INTERNAL_URL || 'http://localhost:4000';
    const response = await fetch(`${origin}/api/v1/health/ready`, { cache: 'no-store', signal: AbortSignal.timeout(4000) });
    if (response.status !== 200 && response.status !== 503) return unavailable;
    const health = parseHealth(await response.json());
    if (!health || (response.status === 200) !== (health.status === 'ok')) return unavailable;
    return health;
  } catch { return unavailable; }
}
