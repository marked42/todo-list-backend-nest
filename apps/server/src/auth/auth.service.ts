import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '@/user/user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto) {
    const user = await this.userService.create(dto);
    return user.id;
  }

  async signIn(dto: SignInDto) {
    const user = await this.validateUserEmail(dto.email, dto.password);

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      accessToken: token,
    };
  }

  async validateUserEmail(email: string, password: string) {
    // 1. 查看用户是否存在
    const user = await this.userService.findByUserEmail(email);

    if (!user) {
      throw new NotFoundException(`用户${email}不存在`);
    }

    // 2. 用户密码是否有效
    const matched = await bcrypt.compare(password, user.encryptedPassword);

    if (!matched) {
      throw new UnauthorizedException('密码错误');
    }

    return user;
  }

  // TODO: TOKENS black list, revoke this token
  signOut(token: string) {
    return 'Logged out successfully ' + token;
  }
}
