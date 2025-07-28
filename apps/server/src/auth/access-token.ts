import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';

export const accessTokenExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();

export const AccessToken = createParamDecorator((ctx: ExecutionContext) => {
  // Assuming the user is stored in the request object
  const request = ctx.switchToHttp().getRequest<Request>();
  const token = accessTokenExtractor(request);
  if (!token) {
    throw new UnauthorizedException('User not authenticated');
  }
  return token;
});
