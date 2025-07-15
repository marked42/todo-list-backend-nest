import { Body, Controller, Post } from '@nestjs/common';
import { CreateTokenDto } from '../dto/CreateTokenDto';
import { AuthService } from '../service/AuthService';
import { Public } from '../decorator/Public';

@Public()
@Controller('tokens')
export class TokenController {
  constructor(private authService: AuthService) {}

  @Post()
  create(@Body() dto: CreateTokenDto) {
    return this.authService.createToken(dto);
  }
}
