import { Global, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TokenModule } from '@/token';
import { UserModule } from '@/user';
import { currentUserProvider } from './current-user';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy, JwtStrategy } from './strategies';

@Global()
@Module({
  imports: [UserModule, TokenModule.forRoot(), ThrottlerModule.forRoot()],
  controllers: [AuthController],
  providers: [AuthService, currentUserProvider, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
