import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import { JwtConfig } from '../jwt.config';

export interface JwtPayload {
  sub: number;
  email: string;
  aud: string;
  iss: string;
  exp: number;
  iat: number;
}

export interface JwtUser {
  id: number;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(JwtConfig.KEY) private jwtConfig: ConfigType<typeof JwtConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.accessTokenSecret,
    });
  }

  validate(payload: JwtPayload): JwtUser {
    return { id: payload.sub, email: payload.email };
  }
}
