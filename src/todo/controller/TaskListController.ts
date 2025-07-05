import { Body, Controller, Delete, Param, Post, Req } from '@nestjs/common';
import { TaskService } from '../service/TaskService';
import { TaskListCreateRequest } from '../dto/TaskListCreateRequest';
import { TaskList } from '../entity/TaskList';
import { RequestUser, User } from '../../core/entity/User';
import { Request } from 'express';

@Controller('/task-list')
export class TaskListController {
  constructor(private taskService: TaskService) {}

  @Post()
  createTaskList(@Body() request: TaskListCreateRequest, @Req() req: Request) {
    const taskList = new TaskList();
    taskList.name = request.name;

    // TODO: extract as decorator
    const currentUser = req['user'] as RequestUser;
    const user = new User();
    user.id = currentUser.id;

    taskList.createdBy = user;

    return this.taskService.createTaskList(taskList);
  }

  @Delete('/:id')
  async deleteTaskList(@Param('id') id: number) {
    console.log('Deleting task list with ID:', typeof id, id);
    await this.taskService.deleteTaskList(id);
    return {
      success: true,
      message: `Task list with ID ${id} deleted successfully`,
    };
  }
}
