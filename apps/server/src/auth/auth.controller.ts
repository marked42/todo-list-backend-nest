import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccessToken } from '@/token';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from './dto';
import { JwtIgnoreExpirationAuthGuard, UserAwareThrottlerGuard } from './guard';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/sign-up')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Post('/refresh-tokens')
  @UseGuards(UserAwareThrottlerGuard)
  refreshToken(@Body('token') token: string) {
    return this.authService.refreshToken(token);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/sign-out')
  @UseGuards(JwtIgnoreExpirationAuthGuard)
  signOut(@AccessToken() token: string) {
    return this.authService.signOut(token);
  }
}
