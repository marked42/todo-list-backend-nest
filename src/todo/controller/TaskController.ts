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
import { TaskMoveResult } from '../model';
import { TaskCreateRequest } from '../dto/TaskCreateRequest';
import { TaskUpdateRequest } from '../dto/TaskUpdateRequest';
import {
  TaskReorderRequest,
  TaskReorderRequests,
} from '../dto/TaskReorderRequest';
import { TaskMoveRequest, TaskMoveRequests } from '../dto/TaskMoveRequest';
import { TaskService } from '../service/TaskService';
import { TaskQueryParam } from '../dto/TaskQueryParam';
import { UnionTypeValidationPipe } from '@/common/decorator/UnionTypeValidationPipe';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async getTasks(@Query() taskQueryParam: TaskQueryParam) {
    return this.taskService.getTasks(taskQueryParam);
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
  async moveTask(
    @Param('id', new ParseIntPipe({ optional: false })) taskId: number,
    @Body(new UnionTypeValidationPipe(TaskMoveRequests))
    request: TaskMoveRequest,
  ) {
    const moved = await this.taskService.moveTask(taskId, request);

    switch (moved) {
      case TaskMoveResult.AlreadyInPlace:
        return {
          success: true,
          message: `Task with ID ${taskId} is already in task list ${request.taskListId}`,
        };
      case TaskMoveResult.Success:
        return {
          success: true,
          message: `Task with ID ${taskId} moved to task list ${request.taskListId} successfully`,
        };
      default:
        throw new Error('unreachable case');
    }
  }

  @Patch('/:id/reorder')
  reorderTask(
    @Param('id') taskId: number,
    @Body(new UnionTypeValidationPipe(TaskReorderRequests))
    request: TaskReorderRequest,
  ) {
    // TODO: same as moveTask
    return this.taskService.reorderTask(taskId, request);
  }
}
