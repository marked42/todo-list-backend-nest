import { Module } from '@nestjs/common';
import { TaskController } from './controller/TaskController';
import { TaskService } from './service/TaskService';

@Module({
  imports: [],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [],
})
export class TodoModule {}
