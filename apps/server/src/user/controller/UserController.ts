import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../service/UserService';
import { CreateUserDto } from '../dto/CreateUserDto';
import { Public } from '@/auth/decorator/Public';

@Public()
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }
}
