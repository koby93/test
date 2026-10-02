import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { PlatformLogger } from '../logging/platform-logger.service';
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  readonly client: ReturnType<typeof createClient>;
  constructor(config: ConfigService, logger: PlatformLogger) {
    this.client = createClient({ url: config.getOrThrow<string>('REDIS_URL'), socket: { connectTimeout: 3000, reconnectStrategy: retries => Math.min(100 * (retries + 1), 2000) } });
    this.client.on('error', () => logger.logger.warn({ event: 'redis.connection_error' }));
  }
  async onModuleInit() { await this.client.connect(); }
  async ping() {
    if (!this.client.isReady) throw new Error('Redis unavailable');
    return this.client.ping();
  }
  async onModuleDestroy() { if (this.client.isOpen) this.client.destroy(); }
}
