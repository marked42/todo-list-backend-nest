import { Global, Module } from '@nestjs/common';
import { UserController } from './controller/UserController';
import { UserService } from './service/UserService';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/User';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [],
})
export class CoreModule {}
