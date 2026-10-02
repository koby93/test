import { Controller, Get, Query } from '@nestjs/common';
import { ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { WORKFLOW_KINDS } from '@nita/contracts';
import { Public } from '../auth/auth.decorators';
export class PlatformQuery {
  @ApiPropertyOptional({ enum: ['summary', 'capabilities'] }) @IsOptional() @IsIn(['summary', 'capabilities']) detail?: string;
}
@ApiTags('Platform')
@Public()
@Controller({ path: 'platform', version: '1' })
export class PlatformController {
  @Get()
  info(@Query() query: PlatformQuery) {
    return {
      application: 'NITA Technical Clearance and Conformity Management System', module: 0, version: '0.1.0',
      ...(query.detail === 'capabilities' ? { workflowKinds: WORKFLOW_KINDS, authentication: 'OIDC / Keycloak-ready', laterModules: 'not implemented' } : {}),
    };
  }
}
