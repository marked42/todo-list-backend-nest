import {
  BadRequestException,
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
import { MoveTaskResult, ReorderTaskResult } from '../enum/MoveTaskResult';
import { TaskPosition, TaskReorderRequest } from '../dto/TaskReorderRequest';

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
      // TODO: in specified order
      order: { order: 'ASC' },
    });
    return tasks;
  }

  async createTask(request: TaskCreateRequest) {
    await this.validateTaskList(request.taskListId);

    const lastTask = await this.taskRepo.findOne({
      where: {
        creator: { id: this.userId },
        taskList: { id: request.taskListId },
      },
      order: { order: 'DESC' },
    });
    // new task at last by default
    const newOrder = lastTask ? lastTask.order + 1 : 0;

    const task = this.taskRepo.create({
      name: request.name,
      taskList: { id: request.taskListId },
      creator: { id: this.userId },
      order: newOrder,
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
    // TODO: default task order
    await this.taskRepo.save(task);
    return MoveTaskResult.Moved;
  }

  private async moveToFirst(taskId: number) {
    const task = await this.validateTask(taskId);

    const firstTask = await this.taskRepo.findOne({
      where: {
        creator: { id: this.userId },
        taskList: { id: task.taskListId },
      },
      order: { order: 'ASC' },
    });

    if (firstTask?.id === taskId) {
      return ReorderTaskResult.AlreadyInPlace;
    }

    // TODO: may underflow
    const newOrder = firstTask ? firstTask.order - 1 : 0;
    task.order = newOrder;

    await this.taskRepo.save(task);
    return ReorderTaskResult.Moved;
  }

  private async moveToLast(taskId: number) {
    const task = await this.validateTask(taskId);

    const lastTask = await this.taskRepo.findOne({
      where: {
        creator: { id: this.userId },
        taskList: { id: task.taskListId },
      },
      order: { order: 'DESC' },
    });

    if (lastTask?.id === taskId) {
      return ReorderTaskResult.AlreadyInPlace;
    }

    // TODO: may overflow
    const newOrder = lastTask ? lastTask.order + 1 : 0;
    task.order = newOrder;

    await this.taskRepo.save(task);
    return ReorderTaskResult.Moved;
  }

  async reorderTask(taskId: number, request: TaskReorderRequest) {
    const { position, targetTaskId } = request;

    if (position === TaskPosition.First) {
      return this.moveToFirst(taskId);
    }

    if (position === TaskPosition.Last) {
      return this.moveToLast(taskId);
    }

    // TODO: better checked by parameter validation
    if (targetTaskId === undefined) {
      // If no target task is specified, we cannot reorder
      throw new BadRequestException(
        'Target task ID must be provided for relative reordering (Before, After)',
      );
    }

    if (taskId === targetTaskId) {
      return ReorderTaskResult.AlreadyInPlace;
    }

    const task = await this.validateTask(taskId);
    const targetTask = await this.validateTask(targetTaskId);

    const beforeTargetTask =
      position === TaskPosition.Before && task.order === targetTask.order - 1;
    const afterTargetTask =
      position === TaskPosition.After && task.order === targetTask.order + 1;
    const alreadyInPlace = beforeTargetTask || afterTargetTask;
    if (alreadyInPlace) {
      return ReorderTaskResult.AlreadyInPlace;
    }

    const tasks = await this.taskRepo.find({
      where: {
        creator: { id: this.userId },
        taskList: { id: task.taskListId },
      },
      order: { order: 'ASC' },
    });
    const taskOrder = task.order;
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    const targetTaskOrder = targetTask.order;
    const targetTaskIndex = tasks.findIndex((t) => t.id === targetTaskId);

    let changedTasks = [] as Task[];
    let startOrder = 0;
    if (taskOrder > targetTaskOrder) {
      if (position === TaskPosition.Before) {
        changedTasks = [task, ...tasks.slice(targetTaskIndex, taskIndex)];
        startOrder = targetTaskOrder;
      } else if (position === TaskPosition.After) {
        changedTasks = [task, ...tasks.slice(targetTaskIndex + 1, taskIndex)];
        startOrder = targetTaskOrder + 1;
      }
    } else if (taskOrder < targetTaskOrder) {
      if (position === TaskPosition.Before) {
        changedTasks = [...tasks.slice(taskIndex + 1, targetTaskIndex), task];
        startOrder = taskOrder;
      } else if (position === TaskPosition.After) {
        changedTasks = [
          ...tasks.slice(taskIndex + 1, targetTaskIndex + 1),
          task,
        ];
        startOrder = taskOrder;
      }
    } else {
      throw new ForbiddenException('Impossible case: task orders are equal');
    }

    changedTasks.forEach((t, index) => {
      t.order = startOrder + index;
    });

    await this.taskRepo.save(changedTasks);
    return ReorderTaskResult.Moved;
  }

  private async findTaskOrThrow(taskId: number) {
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
