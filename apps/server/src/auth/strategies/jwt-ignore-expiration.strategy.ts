import { Strategy } from 'passport-jwt';
import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigType } from '@nestjs/config';
import { AccessTokenConfig, accessTokenExtractor } from '@/token';
import { JwtUserPayload } from '../interface';
import { toJwtRequestUser } from '../util';

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
