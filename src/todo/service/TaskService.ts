import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/core/entity/User';
import { TaskList } from '../entity/TaskList';
import { Task } from '../entity/Task';
import { TaskCreateRequest } from '../dto/TaskCreateRequest';
import { TaskUpdateRequest } from '../dto/TaskUpdateRequest';

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
    return this.taskListRepo.save(taskList);
  }

  async deleteTaskList(taskListId: number, userId: number) {
    await this.validateTaskList(taskListId, userId);

    return this.taskListRepo.delete(taskListId);
  }

  async renameTaskList(
    taskListId: number,
    userId: number,
    newName: string,
  ): Promise<TaskList> {
    const taskList = await this.validateTaskList(taskListId, userId);
    taskList.name = newName;
    return this.taskListRepo.save(taskList);
  }

  private async findTaskListOrThrow(taskListId: number): Promise<TaskList> {
    const taskList = await this.taskListRepo.findOne({
      where: { id: taskListId },
      relations: ['createdBy'],
    });
    if (!taskList) {
      throw new NotFoundException(`Task list with ID ${taskListId} not found`);
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

    return this.taskRepo.delete(taskId);
  }

  async updateTask(
    taskId: number,
    userId: number,
    updateData: TaskUpdateRequest,
  ): Promise<Task> {
    const task = await this.validateTask(taskId, userId);

    // Update only the fields that are provided in updateData
    Object.assign(task, updateData);

    return this.taskRepo.save(task);
  }

  async moveToAnotherTaskList(
    taskId: number,
    targetTaskListId: number,
    userId: number,
  ) {
    const task = await this.validateTask(taskId, userId);
    if (task.taskList.id === targetTaskListId) {
      return false;
    }
    const targetTaskList = await this.validateTaskList(
      targetTaskListId,
      userId,
    );

    task.taskList = targetTaskList;
    await this.taskRepo.save(task);
    return true;
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
