import { AuthGuard } from '@nestjs/passport';

// This guard ignores the expiration of JWT tokens
// It can be used for routes where you want to allow access even if the token is expired
export class JwtIgnoreExpirationAuthGuard extends AuthGuard(
  'jwt-ignore-expiration',
) {}

export class JwtAuthGuard extends AuthGuard('jwt') {
  // This guard uses the standard JWT strategy which checks for token expiration
  // It can be used for routes where you want to enforce token validity
}
