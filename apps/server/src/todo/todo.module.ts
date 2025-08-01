import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@/user';
import { AuthModule } from '@/auth';
import { TaskService } from './task.service';
import { Task, TaskList } from './entity';
import { TaskListController } from './task-list.controller';
import { TaskController } from './task.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskList]), UserModule, AuthModule],
  controllers: [TaskController, TaskListController],
  providers: [TaskService],
  exports: [],
})
export class TodoModule {}
