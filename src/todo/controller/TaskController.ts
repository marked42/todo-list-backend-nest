import {
  Body,
  Controller,
  Delete,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { TaskCreateRequest } from '../dto/TaskCreateRequest';
import { TaskService } from '../service/TaskService';
import { CurrentUser } from '../../core/decorator/CurrentUser';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  helloTask() {
    return 'helloTask';
  }

  @Post()
  createTask(
    @Body() request: TaskCreateRequest,
    @CurrentUser('id') userId: number,
  ) {
    return this.taskService.createTask(request, userId);
  }

  @Delete('/:id')
  async deleteTask(
    @Query('id', new ParseIntPipe({ optional: false })) id: number,
  ) {
    // TODO: 只能删除自己的任务
    await this.taskService.deleteTask(id);

    return {
      success: true,
      message: `Task with ID ${id} deleted successfully`,
    };
  }
}
