import { Global, Module } from '@nestjs/common';
import { UserController } from './controller/UserController';
import { UserService } from './service/UserService';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/User';
import { Role } from './entity/Role';
import { JwtModule } from '@nestjs/jwt';
import { TokenController } from './controller/TokenController';
import { AuthService } from './service/AuthService';

// TODO: use as secret
export const jwtConstants = {
  secret:
    'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '300s' },
    }),
  ],
  controllers: [UserController, TokenController],
  providers: [UserService, AuthService],
  exports: [],
})
export class CoreModule {}
