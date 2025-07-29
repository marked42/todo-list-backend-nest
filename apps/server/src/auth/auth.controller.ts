import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtIgnoreExpirationAuthGuard } from './guard/auth-ignore-expiration.guard';
import { AccessToken } from './access-token';
import { UserAwareThrottlerGuard } from './guard/user-aware-throttler.guard';

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
