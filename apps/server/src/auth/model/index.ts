export const CURRENT_USER = Symbol('CURRENT_USER');

export interface JwtUserPayload {
  sub: number;
  email: string;
  aud: string;
  iss: string;
  exp: number;
  iat: number;
}

export interface JwtRequestUser {
  id: number;
  email: string;
}

export function toJwtRequestUser(payload: JwtUserPayload): JwtRequestUser {
  const { sub, ...rest } = payload;

  return {
    id: sub,
    ...rest,
  };
}
