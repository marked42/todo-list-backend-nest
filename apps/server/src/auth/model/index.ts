export const CURRENT_USER = Symbol('CURRENT_USER');

export interface JwtUserBasicPayload {
  sub: number;
  email: string;
  device: string;
  geoLocation: string;
  version: string;
}

export interface JwtUserPayload extends JwtUserBasicPayload {
  aud: string;
  iss: string;
  exp: number;
  iat: number;
}

export interface JwtRequestUser extends Omit<JwtUserPayload, 'sub'> {
  id: JwtUserPayload['sub'];
}

export function toJwtRequestUser(payload: JwtUserPayload): JwtRequestUser {
  const { sub, ...rest } = payload;

  return {
    id: sub,
    ...rest,
  };
}
