import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entity/refresh-token.entity';
import { AccessTokenConfig, RefreshTokenConfig } from './config';
import { AccessTokenService, RefreshTokenService } from './service';

@Module({})
export class TokenModule {
  static forRoot(): DynamicModule {
    return {
      module: TokenModule,
      imports: [
        ConfigModule.forFeature(AccessTokenConfig),
        ConfigModule.forFeature(RefreshTokenConfig),
        TypeOrmModule.forFeature([RefreshTokenEntity]),
      ],
      providers: [
        {
          provide: AccessTokenConfig.KEY,
          useFactory: AccessTokenConfig,
        },
        AccessTokenService,
        {
          provide: RefreshTokenConfig.KEY,
          useFactory: RefreshTokenConfig,
        },
        RefreshTokenService,
      ],
      exports: [
        AccessTokenConfig.KEY,
        RefreshTokenConfig.KEY,
        RefreshTokenService,
        AccessTokenService,
      ],
    };
  }
}
