import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { TaskCreateRequest } from '../dto/TaskCreateRequest';
import { TaskService } from '../service/TaskService';
import { RequestUser } from 'src/core/entity/User';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  helloTask() {
    return 'helloTask';
  }

  @Post()
  createTask(@Body() request: TaskCreateRequest, @Req() req: Request) {
    // TODO: extract as decorator
    const currentUser = req['user'] as RequestUser;

    return this.taskService.createTask(request, currentUser.id);
  }
}
