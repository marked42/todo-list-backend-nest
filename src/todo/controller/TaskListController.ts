import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TaskService } from '../service/TaskService';
import { TaskListCreateRequest } from '../dto/TaskListCreateRequest';
import { TaskList } from '../entity/TaskList';
import { User } from '@/core/entity/User';
import { CurrentUser } from '@/core/decorator/CurrentUser';

@Controller('/task-lists')
export class TaskListController {
  constructor(private taskService: TaskService) {}

  @Get()
  getTaskLists(
    @Query('userId', new ParseIntPipe({ optional: true })) userId?: number,
  ) {
    return this.taskService.getTaskLists(userId);
  }

  @Post()
  createTaskList(
    @Body() request: TaskListCreateRequest,
    @CurrentUser('id') userId: number,
  ) {
    const taskList = new TaskList();
    taskList.name = request.name;

    const user = new User();
    user.id = userId;

    taskList.createdBy = user;

    return this.taskService.createTaskList(taskList);
  }

  @Delete('/:id')
  async deleteTaskList(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    await this.taskService.deleteTaskList(id, userId);
    return {
      success: true,
      message: `Task list with ID ${id} deleted successfully`,
    };
  }

  @Patch('/:id/rename')
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
