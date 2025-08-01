import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import {
  AccessTokenConfig,
  accessTokenExtractor,
  TokenBlacklistService,
} from '@/token';
import { JwtUserPayload } from '../interface';
import { toJwtRequestUser } from '../util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(AccessTokenConfig.KEY)
    private config: ConfigType<typeof AccessTokenConfig>,
    private tokenBlacklistService: TokenBlacklistService, // Assuming you have a service to handle token blacklisting
  ) {
    super({
      jwtFromRequest: accessTokenExtractor,
      ignoreExpiration: false,
      secretOrKey: config.jwtOptions.secret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtUserPayload) {
    const token = accessTokenExtractor(request)!;
    const isBlacklisted =
      await this.tokenBlacklistService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token is blacklisted');
    }

    return toJwtRequestUser(payload);
  }
}
