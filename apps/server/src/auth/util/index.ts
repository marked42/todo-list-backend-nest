import { JwtRequestUser, JwtUserPayload } from '../interface';

export function toJwtRequestUser(payload: JwtUserPayload): JwtRequestUser {
  const { sub, ...rest } = payload;

  return {
    id: sub,
    ...rest,
  };
}
