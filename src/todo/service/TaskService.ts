import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskList } from '../entity/TaskList';
import { Repository } from 'typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskList) private taskListRepo: Repository<TaskList>,
  ) {}

  async getTaskLists(userId?: number): Promise<TaskList[]> {
    const result = await this.taskListRepo.find({
      where: { createdBy: { id: userId } },
      relations: ['createdBy'],
    });
    return result;
  }

  async createTaskList(taskList: TaskList) {
    return this.taskListRepo.save(taskList);
  }

  async deleteTaskList(id: number) {
    const result = await this.taskListRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Task list with ID ${id} not found`);
    }
  }

  async renameTaskList(id: number, name: string): Promise<TaskList> {
    const taskList = await this.taskListRepo.findOneBy({ id });
    if (!taskList) {
      throw new NotFoundException(`Task list with ID ${id} not found`);
    }
    taskList.name = name;
    return this.taskListRepo.save(taskList);
  }
}
