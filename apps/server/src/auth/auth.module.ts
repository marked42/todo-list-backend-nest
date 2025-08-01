import { Global, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from '@/user/user.module';
import { currentUserProvider } from './current-user';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenModule } from '@/token/token.module';

@Global()
@Module({
  imports: [
    UserModule,
    TokenModule.forRoot(),
    // eslint-disable-next-line
    ThrottlerModule.forRoot(),
  ],
  controllers: [AuthController],
  providers: [AuthService, currentUserProvider, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
