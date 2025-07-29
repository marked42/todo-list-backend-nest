import { Request } from 'express';
import { Global, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from '@/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CURRENT_USER } from './model';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenBlacklistService } from './token-blacklist.service';
import { RefreshTokenRepository } from './repository/refresh-token.repository';
import { RefreshTokenEntity } from './entity/refresh-token.entity';
import { TokenModule } from '@/token/token.module';

@Global()
@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([RefreshTokenEntity]),
    TokenModule.forRoot(),
    // eslint-disable-next-line
    ThrottlerModule.forRoot(),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: CURRENT_USER,
      /**
       * use a factory to ensure it is set per request,
       * injections happens on startup when request.user is undefined,
       * request.user is set by passport after authentication for each request,
       * so returns a function delaying the access to request.user
       */
      useFactory: (request: Request) => () => request.user,
      inject: [REQUEST],
      scope: Scope.REQUEST,
    },
    LocalStrategy,
    JwtStrategy,
    TokenBlacklistService,
    RefreshTokenRepository,
  ],
  exports: [CURRENT_USER],
})
export class AuthModule {}
