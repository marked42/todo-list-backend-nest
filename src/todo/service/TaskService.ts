import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/core/entity/User';
import { TaskList } from '../entity/TaskList';
import { Task } from '../entity/Task';
import { TaskCreateRequest } from '../dto/TaskCreateRequest';
import { TaskUpdateRequest } from '../dto/TaskUpdateRequest';
import { CURRENT_USER } from '@/auth/const';
import { TaskListCreateRequest } from '../dto/TaskListCreateRequest';
import { MoveTaskResult } from '../enum/MoveTaskResult';

@Injectable({ scope: Scope.REQUEST })
export class TaskService {
  constructor(
    @InjectRepository(TaskList) private taskListRepo: Repository<TaskList>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    // TODO: user may not exist, anonymous user
    @Inject(CURRENT_USER) private user: User,
  ) {}

  private get userId() {
    return this.user.id;
  }

  async getTaskLists() {
    // TODO: fix type
    const result = await this.taskListRepo.find({
      where: { creator: { id: this.userId } },
    });
    return result;
  }

  async createTaskList(request: TaskListCreateRequest) {
    const taskList = this.taskListRepo.create({
      name: request.name,
      creator: { id: this.userId },
    });

    return this.taskListRepo.save(taskList);
  }

  async deleteTaskList(taskListId: number) {
    await this.validateTaskList(taskListId);

    return this.taskListRepo.delete(taskListId);
  }

  async renameTaskList(taskListId: number, newName: string) {
    const taskList = await this.validateTaskList(taskListId);
    taskList.name = newName;
    return this.taskListRepo.save(taskList);
  }

  private async findTaskListOrThrow(taskListId: number) {
    // TODO: fix type
    const taskList = await this.taskListRepo.findOne({
      where: { id: taskListId },
    });
    if (!taskList) {
      throw new NotFoundException(`Task list with ID ${taskListId} not found`);
    }
    return taskList;
  }

  private assertTaskListOwnerOrThrow(taskList: TaskList) {
    if (taskList.creatorId !== this.userId) {
      throw new ForbiddenException(
        `Task list with ID ${taskList.id} not owned by user ${this.userId}`,
      );
    }
  }

  private async validateTaskList(taskListId: number) {
    const taskList = await this.findTaskListOrThrow(taskListId);
    this.assertTaskListOwnerOrThrow(taskList);
    return taskList;
  }

  // TODO: validate userId exist in db
  async getTasks(taskListId?: number) {
    // TODO: get other user's tasks with permission checking
    if (taskListId) {
      await this.validateTaskList(taskListId);
    }

    const tasks = await this.taskRepo.find({
      where: { creator: { id: this.userId }, taskList: { id: taskListId } },
    });
    return tasks;
  }

  async createTask(request: TaskCreateRequest) {
    await this.validateTaskList(request.taskListId);

    const task = this.taskRepo.create({
      name: request.name,
      taskList: { id: request.taskListId },
      creator: { id: this.userId },
    });

    return this.taskRepo.save(task);
  }

  async deleteTask(taskId: number) {
    await this.validateTask(taskId);

    return this.taskRepo.delete(taskId);
  }

  async updateTask(taskId: number, updateData: TaskUpdateRequest) {
    const task = await this.validateTask(taskId);

    // Update only the fields that are provided in updateData
    Object.assign(task, updateData);

    return this.taskRepo.save(task);
  }

  async moveToAnotherTaskList(taskId: number, targetTaskListId: number) {
    const task = await this.validateTask(taskId);
    if (task.taskListId === targetTaskListId) {
      return MoveTaskResult.AlreadyInList;
    }
    const targetTaskList = await this.validateTaskList(targetTaskListId);

    task.taskList = targetTaskList;
    await this.taskRepo.save(task);
    return MoveTaskResult.Moved;
  }

  private async findTaskOrThrow(taskId: number) {
    // TODO: no relations, so taskList field is undefine, fix type
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    return task;
  }

  private assertTaskOwnerOrThrow(task: Task) {
    if (task.creatorId !== this.userId) {
      throw new ForbiddenException(
        `Task with ID ${task.id} not owned by user ${this.userId}`,
      );
    }
  }

  private async validateTask(taskId: number) {
    const task = await this.findTaskOrThrow(taskId);
    this.assertTaskOwnerOrThrow(task);
    return task;
  }
}
