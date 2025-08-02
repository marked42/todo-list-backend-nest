import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';

// This guard ignores the expiration of JWT tokens
// It can be used for routes where you want to allow access even if the token is expired
export class JwtIgnoreExpirationAuthGuard extends AuthGuard(
  'jwt-ignore-expiration',
) {}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  // This guard uses the standard JWT strategy which checks for token expiration
  // It can be used for routes where you want to enforce token validity

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
