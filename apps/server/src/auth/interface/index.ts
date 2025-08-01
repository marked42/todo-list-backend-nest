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
