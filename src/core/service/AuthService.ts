import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenCreateRequest } from '../dto/TokenCreateRequest';
import { UserService } from './UserService';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async createToken(request: TokenCreateRequest) {
    // 1. 查看用户是否存在
    const user = await this.userService.findByUserName(request.username);

    // 2. 用户密码是否有效
    const matched = await bcrypt.compare(
      request.password,
      user.encryptedPassword,
    );

    if (!matched) {
      throw new UnauthorizedException('密码错误');
    }

    // 3. 生成并返回token
    const payload = {
      sub: user.id,
      username: user.username,
    };

    return this.jwtService.signAsync(payload);
  }
}
