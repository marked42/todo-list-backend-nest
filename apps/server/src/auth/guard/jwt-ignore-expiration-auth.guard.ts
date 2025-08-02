import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JWT_IGNORE_EXPIRATION_STRATEGY } from '../constants';
import { IS_PUBLIC_KEY } from '../decorator';

// This guard ignores the expiration of JWT tokens
// It can be used for routes where you want to allow access even if the token is expired
@Injectable()
export class JwtIgnoreExpirationAuthGuard extends AuthGuard(
  JWT_IGNORE_EXPIRATION_STRATEGY,
) {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
