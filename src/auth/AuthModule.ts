import { Request } from 'express';
import { Global, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '@/user/UserModule';
import { CURRENT_USER, jwtConstants } from './model';
import { TokenController } from './controller/TokenController';
import { AuthService } from './service/AuthService';

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
  controllers: [TokenController],
  providers: [
    AuthService,
    {
      provide: CURRENT_USER,
      useFactory: (request: Request) => request.user,
      inject: [REQUEST],
      scope: Scope.REQUEST,
    },
  ],
  // TODO: no need ?
  exports: [CURRENT_USER],
})
export class AuthModule {}
