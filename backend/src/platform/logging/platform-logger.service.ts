import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pino, { Logger } from 'pino';

@Injectable()
export class PlatformLogger implements LoggerService {
  readonly logger: Logger;
  constructor(config: ConfigService) {
    this.logger = pino({
      level: config.get<string>('LOG_LEVEL', 'info'),
      base: { service: 'nita-platform-api' },
      redact: { paths: ['authorization', 'cookie', 'password', 'secret', 'token', '*.password', '*.secret', '*.token'], censor: '[REDACTED]' },
    });
  }
  log(message: unknown, context?: string) { this.logger.info({ context, message }); }
  error(message: unknown, _trace?: string, context?: string) { this.logger.error({ context, message }); }
  warn(message: unknown, context?: string) { this.logger.warn({ context, message }); }
  debug(message: unknown, context?: string) { this.logger.debug({ context, message }); }
  verbose(message: unknown, context?: string) { this.logger.trace({ context, message }); }
}
