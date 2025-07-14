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
import { CreateTaskDto } from '../dto/CreateTaskDto';
import { UpdateTaskDto } from '../dto/UpdateTaskDto';
import { ReorderTaskDto, ReorderTaskDtoClasses } from '../dto/ReorderTaskDto';
import { MoveTaskDto, MoveTaskDtoClasses } from '../dto/MoveTaskDto';
import { TaskService } from '../service/TaskService';
import { QueryTaskDto } from '../dto/QueryTaskDto';
import { UnionTypeValidationPipe } from '@/common/decorator/UnionTypeValidationPipe';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async getTasks(@Query() taskQueryParam: QueryTaskDto) {
    return this.taskService.getTasks(taskQueryParam);
  }

  @Post()
  async createTask(@Body() request: CreateTaskDto) {
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
    @Body() updateData: UpdateTaskDto,
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
    @Body(new UnionTypeValidationPipe(MoveTaskDtoClasses))
    request: MoveTaskDto,
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
  async reorderTask(
    @Param('id') taskId: number,
    @Body(new UnionTypeValidationPipe(ReorderTaskDtoClasses))
    request: ReorderTaskDto,
  ) {
    const moved = await this.taskService.reorderTask(taskId, request);

    switch (moved) {
      case TaskMoveResult.AlreadyInPlace:
        return {
          success: true,
          message: `Task with ID ${taskId} is already in place.`,
        };
      case TaskMoveResult.Success:
        return {
          success: true,
          message: `Task with ID ${taskId} reordered successfully`,
        };
      default:
        throw new Error('unreachable case');
    }
  }
}
