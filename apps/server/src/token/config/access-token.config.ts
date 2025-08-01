import { registerAs } from '@nestjs/config';

export const AccessTokenConfig = registerAs('accessToken', () => {
  return {
    jwtModuleOptions: {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET || 'default_secret',
      audience: process.env.JWT_TOKEN_AUDIENCE,
      issuer: process.env.JWT_TOKEN_ISSUER,
      expiresIn: process.env.JWT_ACCESS_TOKEN_TTL || '1h',
    },
  };
});
