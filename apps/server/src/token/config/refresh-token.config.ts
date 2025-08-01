import { registerAs } from '@nestjs/config';

export const RefreshTokenConfig = registerAs('refreshToken', () => {
  return {
    jwtModuleOptions: {
      signOptions: {
        audience: process.env.JWT_TOKEN_AUDIENCE,
        issuer: process.env.JWT_TOKEN_ISSUER,
        expiresIn: process.env.JWT_REFRESH_TOKEN_TTL || '1d',
      },
      secret: process.env.JWT_REFRESH_TOKEN_SECRET || 'default_refresh_secret',
    },
    maxTokenCountPerUser: 5,
  };
});
