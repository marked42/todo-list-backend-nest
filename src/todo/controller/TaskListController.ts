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

@Controller('/task-lists')
export class TaskListController {
  constructor(private taskService: TaskService) {}

  @Get()
  getTaskLists() {
    return this.taskService.getTaskLists();
  }

  @Post()
  createTaskList(@Body() request: TaskListCreateRequest) {
    return this.taskService.createTaskList(request);
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
