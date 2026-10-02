import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PUBLIC_ROUTE } from './auth.decorators';
import { OidcService } from './oidc.service';
import { PlatformRequest } from '../http/request-context';
@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly oidc: OidcService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<PlatformRequest>();
    request.actor = await this.oidc.authenticate(request.headers.authorization);
    return true;
  }
}
