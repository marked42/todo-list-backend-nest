import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthGuard } from '@nestjs/passport';

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
  refreshToken(@Body('token') token: string) {
    return this.authService.refreshToken(token);
  }

  @Post('/sign-out')
  @UseGuards(AuthGuard('jwt'))
  signOut(@Req() req: Request) {
    // TODO:
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('no token');
    }
    return this.authService.signOut(token);
  }
}
