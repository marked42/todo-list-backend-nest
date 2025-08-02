import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import {
  AccessTokenConfig,
  accessTokenExtractor,
  AccessTokenService,
} from '@/token';
import { JwtUserPayload } from '../interface';
import { toJwtRequestUser } from '../util';
import { JWT_STRATEGY } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY) {
  constructor(
    @Inject(AccessTokenConfig.KEY)
    private config: ConfigType<typeof AccessTokenConfig>,
    private accessTokenService: AccessTokenService, // Assuming you have a service to handle token blacklisting
  ) {
    super({
      jwtFromRequest: accessTokenExtractor,
      ignoreExpiration: false,
      secretOrKey: config.jwtModuleOptions.secret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtUserPayload) {
    const token = accessTokenExtractor(request)!;
    const isBlacklisted =
      await this.accessTokenService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token is blacklisted');
    }

    return toJwtRequestUser(payload);
  }
}
