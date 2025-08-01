import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenEntity } from './entity/refresh-token.entity';
import { AccessTokenConfig, RefreshTokenConfig } from './config';
import {
  AccessTokenJwtService,
  RefreshTokenJwtService,
  TokenBlacklistService,
  RefreshTokenService,
} from './service';

@Module({})
export class TokenModule {
  static forRoot(): DynamicModule {
    const accessTokenProviders = [
      {
        provide: AccessTokenConfig.KEY,
        useFactory: AccessTokenConfig,
      },
      {
        provide: AccessTokenJwtService,
        useFactory: (config: ConfigType<typeof AccessTokenConfig>) => {
          return new JwtService({
            signOptions: {
              audience: config.jwtOptions.audience,
              issuer: config.jwtOptions.issuer,
              expiresIn: config.jwtOptions.expiresIn,
            },
            secret: config.jwtOptions.secret,
          });
        },
        inject: [AccessTokenConfig.KEY],
      },
    ];

    const refreshTokenProviders = [
      {
        provide: RefreshTokenConfig.KEY,
        useFactory: RefreshTokenConfig,
      },
      {
        provide: RefreshTokenJwtService,
        useFactory: (config: ConfigType<typeof RefreshTokenConfig>) => {
          return new JwtService({
            signOptions: {
              audience: config.jwtOptions.audience,
              issuer: config.jwtOptions.issuer,
              expiresIn: config.jwtOptions.expiresIn,
            },
            secret: config.jwtOptions.secret,
          });
        },
        inject: [RefreshTokenConfig.KEY],
      },
    ];

    return {
      module: TokenModule,
      imports: [
        ConfigModule.forFeature(AccessTokenConfig),
        ConfigModule.forFeature(RefreshTokenConfig),
        TypeOrmModule.forFeature([RefreshTokenEntity]),
      ],
      providers: [
        ...accessTokenProviders,
        ...refreshTokenProviders,
        TokenBlacklistService,
        RefreshTokenService,
      ],
      exports: [
        AccessTokenConfig.KEY,
        AccessTokenJwtService,
        RefreshTokenConfig.KEY,
        RefreshTokenJwtService,
        RefreshTokenService,
        TokenBlacklistService,
      ],
    };
  }
}
