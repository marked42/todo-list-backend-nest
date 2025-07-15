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
import { UnionTypeValidationPipe } from '@/common/decorator/UnionTypeValidationPipe';
import { TaskMoveResult } from '../model';
import { CreateTaskDto } from '../dto/CreateTaskDto';
import { UpdateTaskDto } from '../dto/UpdateTaskDto';
import { ReorderTaskDto, ReorderTaskDtoClasses } from '../dto/ReorderTaskDto';
import { MoveTaskDto, MoveTaskDtoClasses } from '../dto/MoveTaskDto';
import { TaskService } from '../service/TaskService';
import { QueryTaskDto } from '../dto/QueryTaskDto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async getTasks(@Query() dto: QueryTaskDto) {
    return this.taskService.getTasks(dto);
  }

  @Post()
  async createTask(@Body() dto: CreateTaskDto) {
    return this.taskService.createTask(dto);
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
    @Body() dto: UpdateTaskDto,
  ) {
    await this.taskService.updateTask(taskId, dto);
    return {
      success: true,
      message: `Task with ID ${taskId} updated successfully`,
    };
  }

  @Post('/:id/move')
  async moveTask(
    @Param('id', new ParseIntPipe({ optional: false })) taskId: number,
    @Body(new UnionTypeValidationPipe(MoveTaskDtoClasses))
    dto: MoveTaskDto,
  ) {
    const moved = await this.taskService.moveTask(taskId, dto);

    // return data;
    // return { data, message: '' };
    // return { code: 0, data: null, message: '' };

    switch (moved) {
      case TaskMoveResult.AlreadyInPlace:
        return {
          success: true,
          message: `Task with ID ${taskId} is already in task list ${dto.taskListId}`,
        };
      case TaskMoveResult.Success:
        return {
          success: true,
          message: `Task with ID ${taskId} moved to task list ${dto.taskListId} successfully`,
        };
      default:
        throw new Error('unreachable case');
    }
  }

  @Patch('/:id/reorder')
  async reorderTask(
    @Param('id') taskId: number,
    @Body(new UnionTypeValidationPipe(ReorderTaskDtoClasses))
    dto: ReorderTaskDto,
  ) {
    const moved = await this.taskService.reorderTask(taskId, dto);

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
