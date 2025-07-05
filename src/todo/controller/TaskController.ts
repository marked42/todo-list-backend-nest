import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import { TaskCreateRequest } from '../dto/TaskCreateRequest';
import { TaskService } from '../service/TaskService';
import { RequestUser } from 'src/core/entity/User';

@Controller('task-lists/:taskListId/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  helloTask() {
    return 'helloTask';
  }

  @Post()
  createTask(
    @Param('taskListId', ParseIntPipe) taskListId: number,
    @Body() request: TaskCreateRequest,
    @Req() req: Request,
  ) {
    // TODO: extract as decorator
    const currentUser = req['user'] as RequestUser;

    return this.taskService.createTask(taskListId, request, currentUser.id);
  }
}
