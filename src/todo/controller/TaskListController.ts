import { Body, Controller, Post } from '@nestjs/common';
import { TaskService } from '../service/TaskService';
import { TaskListCreateRequest } from '../dto/TaskListCreateRequest';

@Controller('/task-list')
export class TaskListController {
  constructor(private taskService: TaskService) {}

  @Post()
  createTask(@Body() request: TaskListCreateRequest) {
    return this.taskService.createTaskList(request);
  }
}
