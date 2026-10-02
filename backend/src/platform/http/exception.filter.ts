import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { PlatformLogger } from '../logging/platform-logger.service';
import { PlatformRequest } from './request-context';
import { randomUUID } from 'node:crypto';

@Catch()
export class PlatformExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PlatformLogger) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<PlatformRequest>();
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const value = exception instanceof HttpException ? exception.getResponse() : undefined;
    const data = typeof value === 'object' && value !== null ? value as Record<string, unknown> : undefined;
    const messages = data?.message;
    const message = status >= 500 ? 'The service could not complete the request.'
      : typeof value === 'string' ? value : Array.isArray(messages) ? 'Request validation failed.'
        : typeof messages === 'string' ? messages : 'Request could not be completed.';
    const correlationId = request.correlationId || randomUUID();
    this.logger.logger[status >= 500 ? 'error' : 'warn']({ event: 'request.failed', status, correlationId, exceptionType: exception instanceof Error ? exception.name : 'UnknownError' });
    response.status(status).json({
      statusCode: status,
      error: { code: String(data?.code || `HTTP_${status}`), message, ...(Array.isArray(messages) && status < 500 ? { details: messages } : {}) },
      correlationId, timestamp: new Date().toISOString(), path: request.path,
    });
  }
}
