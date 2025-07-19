import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entity/User';
import { CreateUserDto } from '../dto/CreateUserDto';
import { RoleCode } from '../entity/Role';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findByUserName(username: string) {
    return this.userRepository.findOneBy({
      name: username,
    });
  }

  async create(dto: CreateUserDto) {
    const existed = await this.findByUserName(dto.name);

    if (existed) {
      throw new HttpException('用户名已被占用', 400);
    }

    const user = new User();
    user.name = dto.name;

    const salt = await bcrypt.genSalt(10);
    user.encryptedPassword = await bcrypt.hash(dto.password, salt);

    const saved = await this.userRepository.save(user);
    return saved;
  }

  async isAdmin(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    return !!user?.roles?.find((role) => role.code === RoleCode.Admin);
  }
}
