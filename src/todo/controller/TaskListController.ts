import { Body, Controller, Post, Req } from '@nestjs/common';
import { TaskService } from '../service/TaskService';
import { TaskListCreateRequest } from '../dto/TaskListCreateRequest';
import { TaskList } from '../entity/TaskList';
import { RequestUser, User } from '../../core/entity/User';
import { Request } from 'express';

@Controller('/task-list')
export class TaskListController {
  constructor(private taskService: TaskService) {}

  @Post()
  createTask(@Body() request: TaskListCreateRequest, @Req() req: Request) {
    const taskList = new TaskList();
    taskList.name = request.name;

    // TODO: extract as decorator
    const currentUser = req['user'] as RequestUser;
    const user = new User();
    user.id = currentUser.id;

    taskList.createdBy = user;

    return this.taskService.createTaskList(taskList);
  }
}
