export const CURRENT_USER = Symbol('CURRENT_USER');

export const TOKEN_PREFIX = 'Bearer';

export const jwtConstants = {
  secret:
    'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};

export class RequestUser {
  id: number;
  name: string;
}
