import { Injectable } from '@nestjs/common';
import { TaskListCreateRequest } from '../dto/TaskListCreateRequest';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskList } from '../entity/TaskList';
import { Repository } from 'typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskList) private taskListRepo: Repository<TaskList>,
  ) {}

  async createTaskList(request: TaskListCreateRequest) {
    const taskList = new TaskList();
    taskList.name = request.name;

    return this.taskListRepo.save(taskList);
  }
}
