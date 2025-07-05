import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
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
  async deleteTaskList(@Param('id', ParseIntPipe) id: number) {
    await this.taskService.deleteTaskList(id);
    return {
      success: true,
      message: `Task list with ID ${id} deleted successfully`,
    };
  }

  @Patch('/:id')
  async renameTaskList(
    @Param('id', ParseIntPipe) id: number,
    @Query('name') name: string,
  ) {
    const taskList = await this.taskService.renameTaskList(id, name);
    return {
      success: true,
      message: `Task list with ID ${id} renamed successfully`,
      data: taskList,
    };
  }
}
