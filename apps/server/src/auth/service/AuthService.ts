import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '@/user/service/UserService';
import { CreateTokenDto } from '../dto/CreateTokenDto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async createToken(dto: CreateTokenDto) {
    // 1. 查看用户是否存在
    const user = await this.userService.findByUserName(dto.username);

    if (!user) {
      throw new NotFoundException(`用户${dto.username}不存在`);
    }

    // 2. 用户密码是否有效
    const matched = await bcrypt.compare(dto.password, user.encryptedPassword);

    if (!matched) {
      throw new UnauthorizedException('密码错误');
    }

    // 3. 生成并返回token
    const payload = {
      sub: user.id,
      username: user.name,
    };

    return this.jwtService.signAsync(payload);
  }
}
