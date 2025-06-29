import { Global, Module } from '@nestjs/common';
import { UserController } from './controller/UserController';
import { UserService } from './service/UserService';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/User';
import { Role } from './entity/Role';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  controllers: [UserController],
  providers: [UserService],
  exports: [],
})
export class CoreModule {}
