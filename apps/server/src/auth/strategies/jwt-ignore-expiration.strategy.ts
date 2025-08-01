import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import { AccessTokenConfig, accessTokenExtractor } from '@/token';
import { JwtUserPayload, toJwtRequestUser } from '../model';

@Injectable()
export class JwtIgnoreExpirationStrategy extends PassportStrategy(
  Strategy,
  'jwt-ignore-expiration',
) {
  constructor(
    @Inject(AccessTokenConfig.KEY)
    private config: ConfigType<typeof AccessTokenConfig>,
  ) {
    super({
      jwtFromRequest: accessTokenExtractor,
      ignoreExpiration: true,
      secretOrKey: config.jwtOptions.secret,
    });
  }

  validate(payload: JwtUserPayload) {
    return toJwtRequestUser(payload);
  }
}
