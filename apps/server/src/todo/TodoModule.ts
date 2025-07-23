import { Module } from '@nestjs/common';
import { TaskController } from './controller/TaskController';
import { TaskService } from './service/TaskService';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entity/Task';
import { TaskList } from './entity/TaskList';
import { TaskListController } from './controller/TaskListController';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskList]), UserModule],
  controllers: [TaskController, TaskListController],
  providers: [TaskService],
  exports: [],
})
export class TodoModule {}
