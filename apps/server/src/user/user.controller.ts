import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
// circular dependency @/auth
import { JwtAuthGuard } from '@/auth/guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }
}
