import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorator/public.decorator';
import { Request } from 'express';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthGuard } from '@nestjs/passport';

@Public()
@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/sign-up')
  register(@Body() dto: SignUpDto) {
    return this.authService.register(dto);
  }

  @Post('/sign-in')
  @UseGuards(AuthGuard('local'))
  login(@Body() dto: SignInDto) {
    return this.authService.login(dto);
  }

  @Post('/sign-out')
  @UseGuards(AuthGuard('jwt'))
  logout(@Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('no token');
    }
    return this.authService.logout(token);
  }
}
