import { Controller, Get, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../auth/auth.decorators';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../cache/redis.service';
import { StorageService } from '../storage/storage.service';
import type { PlatformHealth } from '@nita/contracts';
import { LiveHealthDto, PlatformHealthDto } from './health.dto';

export async function dependencyCheck(check: () => Promise<unknown>): Promise<'up' | 'down'> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([check(), new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error('Health check timeout')), 3000); })]);
    return 'up';
  } catch { return 'down'; } finally { if (timeout) clearTimeout(timeout); }
}
@ApiTags('Platform health')
@Public()
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService, private readonly storage: StorageService) {}
  @Get('live') @ApiOperation({ summary: 'Process liveness, independent of infrastructure readiness' })
  @ApiOkResponse({ type: LiveHealthDto })
  live() { return { status: 'ok', timestamp: new Date().toISOString() }; }
  @Get('ready') @ApiOperation({ summary: 'Checks PostgreSQL, Redis and the configured object-storage bucket' })
  @ApiOkResponse({ type: PlatformHealthDto }) @ApiServiceUnavailableResponse({ type: PlatformHealthDto })
  async ready(@Res({ passthrough: true }) response: Response): Promise<PlatformHealth> {
    const [database, redis, storage] = await Promise.all([
      dependencyCheck(() => this.prisma.ping()), dependencyCheck(() => this.redis.ping()), dependencyCheck(() => this.storage.ping()),
    ]);
    const status = [database, redis, storage].every(value => value === 'up') ? 'ok' : 'degraded';
    response.status(status === 'ok' ? 200 : 503);
    return { status, timestamp: new Date().toISOString(), checks: { database, redis, storage } };
  }
}
