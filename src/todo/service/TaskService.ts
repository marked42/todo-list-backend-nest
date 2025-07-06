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

  async createTaskList(taskList: TaskList) {
    // TODO: createdBy 字段表示的userId 是否合法由数据库隐式校验，是否应该在这里显式校验
    return this.taskListRepo.save(taskList);
  }

  async deleteTaskList(taskListId: number, userId: number) {
    await this.validateTaskList(taskListId, userId);

    const result = await this.taskListRepo.delete(taskListId);
    if (result.affected === 0) {
      throw new NotFoundException(`Task list with ID ${taskListId} not found`);
    }
  }

  async renameTaskList(id: number, name: string): Promise<TaskList> {
    const taskList = await this.findTaskListOrThrow(id);
    taskList.name = name;
    return this.taskListRepo.save(taskList);
  }

  private async findTaskListOrThrow(taskListId: number): Promise<TaskList> {
    const taskList = await this.taskListRepo.findOneBy({ id: taskListId });
    if (!taskList) {
      throw new NotFoundException(
        `Task list with ID ${taskListId} not found, cannot create task`,
      );
    }
    return taskList;
  }

  private assertTaskListOwnerOrThrow(taskList: TaskList, userId: number) {
    if (taskList.createdBy.id !== userId) {
      throw new ForbiddenException(
        `Task list with ID ${taskList.id} not owned by user ${userId}`,
      );
    }
  }

  private async validateTaskList(
    taskListId: number,
    userId: number,
  ): Promise<TaskList> {
    const taskList = await this.findTaskListOrThrow(taskListId);
    this.assertTaskListOwnerOrThrow(taskList, userId);
    return taskList;
  }

  async createTask(request: TaskCreateRequest, userId: number) {
    const taskList = await this.findTaskListOrThrow(request.taskListId);

    const task = this.taskRepo.create({
      name: request.name,
      taskList: taskList,
      createdBy: { id: userId } as User,
    });

    return this.taskRepo.save(task);
  }

  async deleteTask(taskId: number, userId: number) {
    await this.validateTask(taskId, userId);

    const result = await this.taskRepo.delete(taskId);
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
  }

  private async findTaskOrThrow(taskId: number): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['createdBy'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    return task;
  }

  private assertTaskOwnerOrThrow(task: Task, userId: number) {
    if (task.createdBy.id !== userId) {
      throw new ForbiddenException(
        `Task with ID ${task.id} not owned by user ${userId}`,
      );
    }
  }

  private async validateTask(taskId: number, userId: number): Promise<Task> {
    const task = await this.findTaskOrThrow(taskId);
    this.assertTaskOwnerOrThrow(task, userId);
    return task;
  }
}
