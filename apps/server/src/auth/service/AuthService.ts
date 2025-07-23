import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '@/user/user.service';
import { RegisterDto } from '../dto/RegisterDto';
import { LoginDto } from '../dto/LoginDto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    return this.userService.create(dto);
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.name, dto.password);

    // 3. 生成并返回token
    const payload = {
      sub: user.id,
      username: user.name,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      id: user.id,
      name: user.name,
      access_token: token,
    };
  }

  async validateUser(name: string, password: string) {
    // 1. 查看用户是否存在
    const user = await this.userService.findByUserName(name);

    if (!user) {
      throw new NotFoundException(`用户${name}不存在`);
    }

    // 2. 用户密码是否有效
    const matched = await bcrypt.compare(password, user.encryptedPassword);

    if (!matched) {
      throw new UnauthorizedException('密码错误');
    }

    return user;
  }

  // TODO: TOKENS black list, revoke this token
  logout(token: string) {
    return 'Logged out successfully ' + token;
  }
}
