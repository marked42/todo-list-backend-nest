import { Request } from 'express';
import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtRequestUser } from '../model';

export const CurrentUser = createParamDecorator(
  (key: keyof JwtRequestUser, ctx: ExecutionContext) => {
    // Assuming the user is stored in the request object
    const request = ctx.switchToHttp().getRequest<Request>();
    if (!request.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    const user = request.user as JwtRequestUser;

    return key ? user?.[key] : user;
  },
);
