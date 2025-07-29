import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import { JwtUserPayload, toJwtRequestUser } from '../model';
import { accessTokenExtractor } from '../access-token';
import { AccessTokenJwtConfig } from '@/token';

@Injectable()
export class JwtIgnoreExpirationStrategy extends PassportStrategy(
  Strategy,
  'jwt-ignore-expiration',
) {
  constructor(
    @Inject(AccessTokenJwtConfig.KEY)
    private jwtConfig: ConfigType<typeof AccessTokenJwtConfig>,
  ) {
    super({
      jwtFromRequest: accessTokenExtractor,
      ignoreExpiration: true,
      secretOrKey: jwtConfig.secret,
    });
  }

  validate(payload: JwtUserPayload) {
    return toJwtRequestUser(payload);
  }
}
