import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../service/UserService';
import { CreateUserDto } from '../dto/CreateUserDto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() userCreateRequest: CreateUserDto) {
    return this.userService.create(userCreateRequest);
  }
}
