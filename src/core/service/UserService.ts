import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserCreateRequest } from '../dto/UserCreateRequest';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async findByUserName(username: string) {
    const user = await this.userRepository.findOneBy({
      username,
    });
    if (!user) {
      throw new NotFoundException(`用户${username}不存在`);
    }
    return user;
  }

  async create(userCreateRequest: UserCreateRequest) {
    // TODO:
    const existed = await this.findByUserName(userCreateRequest.username);

    if (existed) {
      throw new HttpException('用户名已被占用', 400);
    }

    const user = new User();
    user.username = userCreateRequest.username;

    const salt = await bcrypt.genSalt(10);
    user.encryptedPassword = await bcrypt.hash(
      userCreateRequest.password,
      salt,
    );

    const saved = await this.userRepository.save(user);
    console.log('saved: ', saved);
    return saved;
  }
}
