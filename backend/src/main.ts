import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { configureApplication } from './configure-application';
async function bootstrap() {
  const app = configureApplication(await NestFactory.create(AppModule, { bufferLogs: true }));
  app.enableShutdownHooks();
  await app.listen(app.get(ConfigService).getOrThrow<number>('PORT'), '0.0.0.0');
}
bootstrap().catch(() => { process.stderr.write('Platform startup failed; check configuration and infrastructure.\n'); process.exitCode = 1; });
