import { HttpException, Injectable } from '@nestjs/common';
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
    return this.userRepository.findOneBy({
      name: username,
    });
  }

  async create(userCreateRequest: UserCreateRequest) {
    const existed = await this.findByUserName(userCreateRequest.username);

    if (existed) {
      throw new HttpException('用户名已被占用', 400);
    }

    const user = new User();
    user.name = userCreateRequest.username;

    const salt = await bcrypt.genSalt(10);
    user.encryptedPassword = await bcrypt.hash(
      userCreateRequest.password,
      salt,
    );

    const saved = await this.userRepository.save(user);
    return saved;
  }
}
