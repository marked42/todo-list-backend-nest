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
import { TaskCreateRequest } from '../dto/TaskCreateRequest';
import { TaskService } from '../service/TaskService';
import { CurrentUser } from '@/core/decorator/CurrentUser';
import { TaskUpdateRequest } from '../dto/TaskUpdateRequest';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async getTasks(
    @CurrentUser('id') userId: number,
    @Query('taskListId', new ParseIntPipe({ optional: true }))
    taskListId?: number,
  ) {
    return this.taskService.getTasks(userId, taskListId);
  }

  @Post()
  async createTask(
    @Body() request: TaskCreateRequest,
    @CurrentUser('id') userId: number,
  ) {
    return this.taskService.createTask(request, userId);
  }

  @Delete('/:id')
  async deleteTask(
    @Query('id', new ParseIntPipe({ optional: false })) taskId: number,
    @CurrentUser('id') userId: number,
  ) {
    await this.taskService.deleteTask(taskId, userId);

    return {
      success: true,
      message: `Task with ID ${taskId} deleted successfully`,
    };
  }

  @Patch('/:id')
  async updateTask(
    @Param('id', new ParseIntPipe({ optional: false })) taskId: number,
    @CurrentUser('id') userId: number,
    @Body() updateData: TaskUpdateRequest,
  ) {
    await this.taskService.updateTask(taskId, userId, updateData);
    return {
      success: true,
      message: `Task with ID ${taskId} renamed successfully`,
    };
  }

  @Patch('/:id/move')
  async moveToAnotherTaskList(
    @Param('id', new ParseIntPipe({ optional: false })) taskId: number,
    @Query('taskListId', new ParseIntPipe({ optional: false }))
    taskListId: number,
    @CurrentUser('id') userId: number,
  ) {
    const moved = await this.taskService.moveToAnotherTaskList(
      taskId,
      taskListId,
      userId,
    );

    if (!moved) {
      return {
        success: true,
        message: `Task with ID ${taskId} is already in task list ${taskListId}`,
      };
    }

    return {
      success: true,
      message: `Task with ID ${taskId} moved to task list ${taskListId} successfully`,
    };
  }
}
