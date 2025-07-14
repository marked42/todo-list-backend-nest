import { Body, Controller, Post } from '@nestjs/common';
import { CreateTokenDto } from '../dto/CreateTokenDto';
import { AuthService } from '../service/AuthService';

@Controller('tokens')
export class TokenController {
  constructor(private authService: AuthService) {}

  @Post()
  create(@Body() tokenCreateRequest: CreateTokenDto) {
    return this.authService.createToken(tokenCreateRequest);
  }
}
