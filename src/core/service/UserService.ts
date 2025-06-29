import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create() {
    const user = new User();
    user.username = 'test';

    const saved = await this.userRepository.save(user);

    console.log('saved: ', saved);
  }
}
