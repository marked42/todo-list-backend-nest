import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import { JwtConfig } from '../jwt.config';
import { JwtUserPayload, toJwtRequestUser } from '../model';
import { accessTokenExtractor } from '../access-token';

@Injectable()
export class JwtIgnoreExpirationStrategy extends PassportStrategy(
  Strategy,
  'jwt-ignore-expiration',
) {
  constructor(
    @Inject(JwtConfig.KEY) private jwtConfig: ConfigType<typeof JwtConfig>,
  ) {
    super({
      jwtFromRequest: accessTokenExtractor,
      ignoreExpiration: true,
      secretOrKey: jwtConfig.accessTokenSecret,
    });
  }

  validate(payload: JwtUserPayload) {
    return toJwtRequestUser(payload);
  }
}
