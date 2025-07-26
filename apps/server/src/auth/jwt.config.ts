import { Inject, Injectable } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

export const JwtConfig = registerAs('jwt', () => {
  return {
    secret: process.env.JWT_SECRET! || 'default_secret',
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER,
    accessTokenTtl: process.env.JWT_ACCESS_TOKEN_TTL || '1h',
    refreshTokenTtl: process.env.JWT_REFRESH_TOKEN_TTL || '1d',
  };
});

// TODO: use this to create a JwtModule
@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  constructor(
    @Inject(JwtConfig.KEY) private jwtConfig: ConfigType<typeof JwtConfig>,
  ) {}

  createJwtOptions(): JwtModuleOptions {
    return {
      global: true,
      signOptions: {
        audience: this.jwtConfig.audience,
        issuer: this.jwtConfig.issuer,
        expiresIn: this.jwtConfig.accessTokenTtl,
      },
      secret: this.jwtConfig.secret,
    };
  }
}
