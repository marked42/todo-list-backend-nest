import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskList } from '../entity/TaskList';
import { Repository } from 'typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskList) private taskListRepo: Repository<TaskList>,
  ) {}

  async createTaskList(taskList: TaskList) {
    return this.taskListRepo.save(taskList);
  }
}
