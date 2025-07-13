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
import { TaskUpdateRequest } from '../dto/TaskUpdateRequest';
import { MoveTaskResult } from '../enum/MoveTaskResult';
import { TaskReorderRequest } from '../dto/TaskReorderRequest';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async getTasks(
    @Query('taskListId', new ParseIntPipe({ optional: true }))
    taskListId?: number,
  ) {
    return this.taskService.getTasks(taskListId);
  }

  @Post()
  async createTask(@Body() request: TaskCreateRequest) {
    return this.taskService.createTask(request);
  }

  @Delete('/:id')
  async deleteTask(
    @Query('id', new ParseIntPipe({ optional: false })) taskId: number,
  ) {
    await this.taskService.deleteTask(taskId);

    return {
      success: true,
      message: `Task with ID ${taskId} deleted successfully`,
    };
  }

  @Patch('/:id')
  async updateTask(
    @Param('id', new ParseIntPipe({ optional: false })) taskId: number,
    @Body() updateData: TaskUpdateRequest,
  ) {
    await this.taskService.updateTask(taskId, updateData);
    return {
      success: true,
      message: `Task with ID ${taskId} updated successfully`,
    };
  }

  // TODO: specify order
  @Post('/:id/move')
  async moveToAnotherTaskList(
    @Param('id', new ParseIntPipe({ optional: false })) taskId: number,
    @Query('taskListId', new ParseIntPipe({ optional: false }))
    taskListId: number,
  ) {
    const moved = await this.taskService.moveToAnotherTaskList(
      taskId,
      taskListId,
    );

    switch (moved) {
      case MoveTaskResult.AlreadyInList:
        return {
          success: true,
          message: `Task with ID ${taskId} is already in task list ${taskListId}`,
        };
      case MoveTaskResult.Moved:
        return {
          success: true,
          message: `Task with ID ${taskId} moved to task list ${taskListId} successfully`,
        };
      default:
        throw new Error('unreachable case');
    }
  }

  @Patch('/:id/reorder')
  reorderTask(
    @Param('id') taskId: number,
    @Query('position') position: TaskReorderRequest,
  ) {
    return this.taskService.reorderTask(taskId, position);
  }
}
