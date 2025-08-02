import { Strategy } from 'passport-jwt';
import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigType } from '@nestjs/config';
import { AccessTokenConfig, accessTokenExtractor } from '@/token';
import { JwtUserPayload } from '../interface';
import { toJwtRequestUser } from '../util';
import { JWT_IGNORE_EXPIRATION_STRATEGY } from '../constants';

@Injectable()
export class JwtIgnoreExpirationStrategy extends PassportStrategy(
  Strategy,
  JWT_IGNORE_EXPIRATION_STRATEGY,
) {
  constructor(
    @Inject(AccessTokenConfig.KEY)
    private config: ConfigType<typeof AccessTokenConfig>,
  ) {
    super({
      jwtFromRequest: accessTokenExtractor,
      ignoreExpiration: true,
      secretOrKey: config.jwtModuleOptions.secret,
    });
  }

  validate(payload: JwtUserPayload) {
    return toJwtRequestUser(payload);
  }
}
