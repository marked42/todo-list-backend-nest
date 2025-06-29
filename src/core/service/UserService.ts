import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  create() {
    // const user = new User();
    // user.username = 'test';

    // const saved = await this.userRepository.save(user);

    // console.log('saved: ', saved);
    return this.configService.get<string>('DATABASE_USER');
  }
}
