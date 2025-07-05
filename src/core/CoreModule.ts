import { Global, Module } from '@nestjs/common';
import { UserController } from './controller/UserController';
import { UserService } from './service/UserService';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/User';
import { Role } from './entity/Role';
import { JwtModule } from '@nestjs/jwt';
import { TokenController } from './controller/TokenController';
import { AuthService } from './service/AuthService';
import { jwtConstants } from './const/user';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guard/AuthGuard';
import { HttpExceptionFilter } from './filter/HttpExceptionFilter';
import { Task } from '../todo/entity/Task';
import { TaskList } from '../todo/entity/TaskList';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Task, TaskList]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3000000000' },
    }),
  ],
  controllers: [UserController, TokenController],
  providers: [
    UserService,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [],
})
export class CoreModule {}
