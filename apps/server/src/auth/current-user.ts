import { Inject, Provider, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

export const CURRENT_USER_TOKEN = Symbol('CURRENT_USER_TOKEN');

export function InjectCurrentUser() {
  return Inject(CURRENT_USER_TOKEN);
}

export const currentUserProvider: Provider = {
  provide: CURRENT_USER_TOKEN,
  /**
   * use a factory to ensure it is set per request,
   * injections happens on startup when request.user is undefined,
   * request.user is set by passport after authentication for each request,
   * so returns a function delaying the access to request.user
   */
  useFactory: (request: Request) => () => request.user,
  inject: [REQUEST],
  scope: Scope.REQUEST,
};
