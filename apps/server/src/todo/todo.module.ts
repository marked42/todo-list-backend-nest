import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entity/task.entity';
import { TaskList } from './entity/task-list.entity';
import { TaskListController } from './task-list.controller';
import { UserModule } from '@/user/user.module';
import { AuthModule } from '@/auth';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskList]), UserModule, AuthModule],
  controllers: [TaskController, TaskListController],
  providers: [TaskService],
  exports: [],
})
export class TodoModule {}
