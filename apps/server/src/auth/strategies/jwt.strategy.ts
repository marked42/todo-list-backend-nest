import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import { JwtConfig } from '../jwt.config';
import { JwtUserPayload, toJwtRequestUser } from '../model';
import { TokenBlacklistService } from '../token-blacklist.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(JwtConfig.KEY) private jwtConfig: ConfigType<typeof JwtConfig>,
    private tokenBlacklistService: TokenBlacklistService, // Assuming you have a service to handle token blacklisting
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.accessTokenSecret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtUserPayload) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request)!;
    const isBlacklisted =
      await this.tokenBlacklistService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token is blacklisted');
    }

    return toJwtRequestUser(payload);
  }
}
