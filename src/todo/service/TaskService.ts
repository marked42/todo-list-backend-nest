import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskList } from '../entity/TaskList';
import { TaskCreateRequest } from '../dto/TaskCreateRequest';
import { Task } from '../entity/Task';
import { User } from '@/core/entity/User';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskList) private taskListRepo: Repository<TaskList>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
  ) {}

  async getTaskLists(userId?: number): Promise<TaskList[]> {
    const result = await this.taskListRepo.find({
      where: { createdBy: { id: userId } },
      relations: ['createdBy'],
    });
    return result;
  }

  createTaskList(taskList: TaskList) {
    // TODO: createdBy 字段表示的userId 是否合法由数据库隐式校验，是否应该在这里显式校验
    return this.taskListRepo.save(taskList);
  }

  async deleteTaskList(taskListId: number, userId: number) {
    const taskList = await this.taskListRepo.findOneBy({ id: taskListId });
    if (!taskList) {
      throw new NotFoundException(`Task list with ID ${taskListId} not found`);
    }

    if (taskList.createdBy.id !== userId) {
      throw new ForbiddenException(
        `Task list with ID ${taskListId} not owned by user ${userId}`,
      );
    }

    const result = await this.taskListRepo.delete(taskListId);
    if (result.affected === 0) {
      throw new NotFoundException(`Task list with ID ${taskListId} not found`);
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

  async createTask(request: TaskCreateRequest, userId: number) {
    const taskList = await this.taskListRepo.findOneBy({
      id: request.taskListId,
    });
    if (!taskList) {
      throw new NotFoundException(
        `Task list with ID ${request.taskListId} not found, cannot create task`,
      );
    }

    const task = this.taskRepo.create({
      name: request.name,
      taskList: taskList,
      createdBy: { id: userId } as User,
    });

    return this.taskRepo.save(task);
  }

  async deleteTask(taskId: number, userId: number) {
    const task = await this.taskRepo.findOneBy({ id: taskId });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    if (task.createdBy.id !== userId) {
      throw new ForbiddenException(
        `Task with ID ${taskId} not owned by user ${userId}`,
      );
    }

    const result = await this.taskRepo.delete(taskId);
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
  }
}
