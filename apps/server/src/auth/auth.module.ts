import { Request } from 'express';
import { Global, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '@/user/user.module';
import { CURRENT_USER, jwtConstants } from './model';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Global()
@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3000000000' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: CURRENT_USER,
      useFactory: (request: Request) => request.user,
      inject: [REQUEST],
      scope: Scope.REQUEST,
    },
    LocalStrategy,
    JwtStrategy,
  ],
  exports: [CURRENT_USER],
})
export class AuthModule {}
