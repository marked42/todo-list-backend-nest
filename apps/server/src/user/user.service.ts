import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { RoleCode } from './entity/role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findUserByEmail(email: string) {
    return this.userRepository.findOneBy({
      email,
    });
  }

  async findUserById(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  async create(dto: CreateUserDto) {
    const existed = await this.findUserByEmail(dto.email);

    if (existed) {
      throw new HttpException('用户名已被占用', 400);
    }

    const user = this.userRepository.create({
      email: dto.email,
      encryptedPassword: await bcrypt.hash(dto.password, 10),
    });

    return this.userRepository.save(user);
  }

  async isAdmin(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    return !!user?.roles?.find((role) => role.code === RoleCode.Admin);
  }
}
