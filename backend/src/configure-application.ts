import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';
import { Response, NextFunction } from 'express';
import { PlatformLogger } from './platform/logging/platform-logger.service';
import { PlatformExceptionFilter } from './platform/http/exception.filter';
import { PlatformRequest } from './platform/http/request-context';
export function configureApplication(app: INestApplication) {
  const config = app.get(ConfigService);
  const logger = app.get(PlatformLogger);
  app.useLogger(logger);
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.use(helmet());
  app.enableCors({ origin: config.getOrThrow<string>('CORS_ORIGIN'), allowedHeaders: ['Authorization', 'Content-Type', 'X-Correlation-ID'], exposedHeaders: ['X-Correlation-ID'] });
  app.use((request: PlatformRequest, response: Response, next: NextFunction) => {
    const provided = request.header('X-Correlation-ID');
    request.correlationId = provided && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(provided) ? provided : randomUUID();
    response.setHeader('X-Correlation-ID', request.correlationId);
    const started = performance.now();
    response.on('finish', () => logger.logger.info({ event: 'http.request', correlationId: request.correlationId, method: request.method, path: request.path, statusCode: response.statusCode, durationMs: Math.round(performance.now() - started) }));
    next();
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, forbidUnknownValues: true, validationError: { target: false, value: false } }));
  app.useGlobalFilters(new PlatformExceptionFilter(logger));
  if (config.get<string>('NODE_ENV') !== 'production') {
    const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('NITA Platform API').setDescription('Module 0 foundation. No business workflow mutation endpoints are exposed.').setVersion('1').addBearerAuth().build());
    SwaggerModule.setup('api/v1/docs', app, document, { jsonDocumentUrl: 'api/v1/openapi.json', swaggerOptions: { persistAuthorization: false } });
  }
  return app;
}
