import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { accessTokenExtractor } from '../extractor/access-token.extractor';

export const AccessToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // Assuming the user is stored in the request object
    const request = ctx.switchToHttp().getRequest<Request>();
    const token = accessTokenExtractor(request);
    if (!token) {
      throw new UnauthorizedException('User not authenticated');
    }
    return token;
  },
);
