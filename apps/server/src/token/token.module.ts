import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenJwtConfig } from './access-token.config';
import { RefreshTokenJwtConfig } from './refresh-token.config';
import { AccessTokenJwtService } from './access-token-jwt.service';
import { RefreshTokenJwtService } from './refresh-token-jwt.service.ts';
import { TokenBlacklistService } from './token-blacklist.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entity/refresh-token.entity';
import { RefreshTokenService } from './service/refresh-token.service';

@Module({})
export class TokenModule {
  static forRoot(): DynamicModule {
    const accessTokenProviders = [
      {
        provide: AccessTokenJwtConfig.KEY,
        useFactory: AccessTokenJwtConfig,
      },
      {
        provide: AccessTokenJwtService,
        useFactory: (jwtConfig: ConfigType<typeof AccessTokenJwtConfig>) => {
          return new JwtService({
            signOptions: {
              audience: jwtConfig.audience,
              issuer: jwtConfig.issuer,
              expiresIn: jwtConfig.expiresIn,
            },
            secret: jwtConfig.secret,
          });
        },
        inject: [AccessTokenJwtConfig.KEY],
      },
    ];

    const refreshTokenProviders = [
      {
        provide: RefreshTokenJwtConfig.KEY,
        useFactory: RefreshTokenJwtConfig,
      },
      {
        provide: RefreshTokenJwtService,
        useFactory: (jwtConfig: ConfigType<typeof RefreshTokenJwtConfig>) => {
          return new JwtService({
            signOptions: {
              audience: jwtConfig.audience,
              issuer: jwtConfig.issuer,
              expiresIn: jwtConfig.expiresIn,
            },
            secret: jwtConfig.secret,
          });
        },
        inject: [RefreshTokenJwtConfig.KEY],
      },
    ];

    return {
      module: TokenModule,
      imports: [
        ConfigModule.forFeature(AccessTokenJwtConfig),
        ConfigModule.forFeature(RefreshTokenJwtConfig),
        TypeOrmModule.forFeature([RefreshTokenEntity]),
      ],
      providers: [
        ...accessTokenProviders,
        ...refreshTokenProviders,
        TokenBlacklistService,
        RefreshTokenService,
      ],
      exports: [
        AccessTokenJwtConfig.KEY,
        AccessTokenJwtService,
        RefreshTokenJwtConfig.KEY,
        RefreshTokenJwtService,
        TokenBlacklistService,
        RefreshTokenService,
      ],
    };
  }
}
