import { Global, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CURRENT_USER } from './const';

@Global()
@Module({
  providers: [
    {
      provide: CURRENT_USER,
      useFactory: (request: Request) => request.user,
      inject: [REQUEST],
      scope: Scope.REQUEST,
    },
  ],
  exports: [CURRENT_USER],
})
export class AuthModule {}
