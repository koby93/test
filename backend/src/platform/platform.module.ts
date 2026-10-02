import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from './database/prisma.service';
import { RedisService } from './cache/redis.service';
import { StorageService } from './storage/storage.service';
import { PlatformLogger } from './logging/platform-logger.service';
import { OidcService } from './auth/oidc.service';
import { AuthenticationGuard } from './auth/auth.guard';
import { AuthorizationService } from './auth/authorization.service';
import { AuditService } from './audit/audit.service';
import { WorkflowRegistry } from './workflow/workflow.registry';
import { WorkflowService } from './workflow/workflow.service';
import { HealthController } from './health/health.controller';
import { PlatformController } from './http/platform.controller';
const services = [PrismaService, RedisService, StorageService, PlatformLogger, OidcService, AuthorizationService, AuditService, WorkflowRegistry, WorkflowService];
@Global()
@Module({ providers: [...services, { provide: APP_GUARD, useClass: AuthenticationGuard }], controllers: [HealthController, PlatformController], exports: services })
export class PlatformModule {}
