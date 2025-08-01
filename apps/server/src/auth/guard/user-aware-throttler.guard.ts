import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { JwtRequestUser } from '../interface';

@Injectable()
export class UserAwareThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const user = req.user as JwtRequestUser;

    return Promise.resolve(String(user.id)); // 使用用户ID或IP作为追踪器
  }
}
