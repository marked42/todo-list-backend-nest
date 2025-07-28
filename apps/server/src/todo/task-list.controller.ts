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
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskListDto } from './dto/create-task-list.dto';
import { JwtAuthGuard } from '@/auth/guard/auth-ignore-expiration.guard';

@Controller('/task-lists')
@UseGuards(JwtAuthGuard)
export class TaskListController {
  constructor(private taskService: TaskService) {}

  @Get()
  getTaskLists() {
    return this.taskService.getTaskLists();
  }

  @Post()
  createTaskList(@Body() dto: CreateTaskListDto) {
    return this.taskService.createTaskList(dto);
  }

  @Delete('/:id')
  async deleteTaskList(@Param('id', ParseIntPipe) id: number) {
    await this.taskService.deleteTaskList(id);
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
