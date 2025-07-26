export const CURRENT_USER = Symbol('CURRENT_USER');

export const TOKEN_PREFIX = 'Bearer';

export class RequestUser {
  id: number;
  name: string;
}
