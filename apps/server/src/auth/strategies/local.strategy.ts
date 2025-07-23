import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'name',
      passwordField: 'password',
      passReqToCallback: false,
    });
  }

  async validate(name: string, password: string) {
    const user = await this.authService.validateUser(name, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user; // 返回的用户会被存入req.user
  }
}
