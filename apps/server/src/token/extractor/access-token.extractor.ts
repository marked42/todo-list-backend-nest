import { ExtractJwt } from 'passport-jwt';

export const accessTokenExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();
