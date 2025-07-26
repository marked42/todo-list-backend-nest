import { Request } from 'express';
import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestUser } from '../model';

export type UserPayload = RequestUser;

export const CurrentUser = createParamDecorator(
  (key: keyof UserPayload, ctx: ExecutionContext) => {
    // Assuming the user is stored in the request object
    const request = ctx.switchToHttp().getRequest<Request>();
    if (!request.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    const user = request.user as UserPayload;

    return key ? user?.[key] : user;
  },
);
