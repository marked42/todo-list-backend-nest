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
import { CreateTaskDto } from '../dto/CreateTaskDto';
import { UpdateTaskDto } from '../dto/UpdateTaskDto';
import { CURRENT_USER } from '@/auth/model';
import { CreateTaskListDto } from '../dto/CreateTaskListDto';
import { TaskMoveResult, TaskPosition } from '../model';
import { ReorderTaskDto } from '../dto/ReorderTaskDto';
import { MoveTaskDto } from '../dto/MoveTaskDto';
import { DEFAULT_TASK_ORDER, QueryTaskDto } from '../dto/QueryTaskDto';

@Injectable({ scope: Scope.REQUEST })
export class TaskService {
  constructor(
    @InjectRepository(TaskList) private taskListRepo: Repository<TaskList>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
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

  async createTaskList(dto: CreateTaskListDto) {
    const taskList = this.taskListRepo.create({
      name: dto.name,
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

  async getTasks(dto?: QueryTaskDto) {
    const { taskListId, order = DEFAULT_TASK_ORDER } = dto || {};
    // TODO: get other user's tasks with permission checking
    if (taskListId) {
      await this.validateTaskList(taskListId);
    }

    const tasks = await this.taskRepo.find({
      where: { creator: { id: this.userId }, taskList: { id: taskListId } },
      order: { order },
    });
    return tasks;
  }

  async createTask(dto: CreateTaskDto) {
    await this.validateTaskList(dto.taskListId);

    const lastTask = await this.taskRepo.findOne({
      where: {
        creator: { id: this.userId },
        taskList: { id: dto.taskListId },
      },
      order: { order: 'DESC' },
    });
    // new task at last by default
    const newOrder = lastTask ? lastTask.order + 1 : 0;

    const task = this.taskRepo.create({
      name: dto.name,
      taskList: { id: dto.taskListId },
      creator: { id: this.userId },
      order: newOrder,
    });

    return this.taskRepo.save(task);
  }

  async deleteTask(taskId: number) {
    await this.validateTask(taskId);

    return this.taskRepo.delete(taskId);
  }

  async updateTask(taskId: number, dto: UpdateTaskDto) {
    const task = await this.validateTask(taskId);

    // Update only the fields that are provided in updateData
    Object.assign(task, dto);

    return this.taskRepo.save(task);
  }

  /**
   * move task to another task list
   */
  async moveTask(taskId: number, dto: MoveTaskDto) {
    const task = await this.validateTask(taskId);
    if (task.taskListId === dto.taskListId) {
      return TaskMoveResult.AlreadyInPlace;
    }
    const targetTaskList = await this.validateTaskList(dto.taskListId);

    const lastTaskInList = await this.taskRepo.findOne({
      where: {
        taskList: { id: targetTaskList.id },
        creator: { id: this.userId },
      },
      order: {
        order: 'DESC',
      },
    });

    task.taskList = targetTaskList;
    // at last by default
    task.order = lastTaskInList ? lastTaskInList.order + 1 : 0;

    await this.taskRepo.save(task);
    return TaskMoveResult.Success;
  }

  private async reorderToFirst(taskId: number) {
    const task = await this.validateTask(taskId);

    const firstTask = await this.taskRepo.findOne({
      where: {
        creator: { id: this.userId },
        taskList: { id: task.taskListId },
      },
      order: { order: 'ASC' },
    });

    if (firstTask?.id === taskId) {
      return TaskMoveResult.AlreadyInPlace;
    }

    // TODO: may underflow
    const newOrder = firstTask ? firstTask.order - 1 : 0;
    task.order = newOrder;

    await this.taskRepo.save(task);
    return TaskMoveResult.Success;
  }

  private async reorderToLast(taskId: number) {
    const task = await this.validateTask(taskId);

    const lastTask = await this.taskRepo.findOne({
      where: {
        creator: { id: this.userId },
        taskList: { id: task.taskListId },
      },
      order: { order: 'DESC' },
    });

    if (lastTask?.id === taskId) {
      return TaskMoveResult.AlreadyInPlace;
    }

    // TODO: may overflow
    const newOrder = lastTask ? lastTask.order + 1 : 0;
    task.order = newOrder;

    await this.taskRepo.save(task);
    return TaskMoveResult.Success;
  }

  /**
   * reorder task to different position in same task list
   */
  async reorderTask(taskId: number, dto: ReorderTaskDto) {
    // TODO: refactor to template method
    if (dto.position === TaskPosition.First) {
      return this.reorderToFirst(taskId);
    }

    if (dto.position === TaskPosition.Last) {
      return this.reorderToLast(taskId);
    }

    if (
      !(
        dto.position === TaskPosition.Before ||
        dto.position === TaskPosition.After
      )
    ) {
      return;
    }
    const { anchorTaskId } = dto;
    const { position } = dto;

    if (taskId === anchorTaskId) {
      return TaskMoveResult.AlreadyInPlace;
    }

    const task = await this.validateTask(taskId);
    const anchorTask = await this.validateTask(anchorTaskId);

    const beforeAnchorTask =
      position === TaskPosition.Before && task.order === anchorTask.order - 1;
    const afterAnchorTask =
      position === TaskPosition.After && task.order === anchorTask.order + 1;
    const alreadyInPlace = beforeAnchorTask || afterAnchorTask;
    if (alreadyInPlace) {
      return TaskMoveResult.AlreadyInPlace;
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
    const anchorTaskOrder = anchorTask.order;
    const anchorTaskIndex = tasks.findIndex((t) => t.id === anchorTaskId);

    let changedTasks = [] as Task[];
    let startOrder = 0;
    if (taskOrder > anchorTaskOrder) {
      if (position === TaskPosition.Before) {
        changedTasks = [task, ...tasks.slice(anchorTaskIndex, taskIndex)];
        startOrder = anchorTaskOrder;
      } else if (position === TaskPosition.After) {
        changedTasks = [task, ...tasks.slice(anchorTaskIndex + 1, taskIndex)];
        startOrder = anchorTaskOrder + 1;
      }
    } else if (taskOrder < anchorTaskOrder) {
      if (position === TaskPosition.Before) {
        changedTasks = [...tasks.slice(taskIndex + 1, anchorTaskIndex), task];
        startOrder = taskOrder;
      } else if (position === TaskPosition.After) {
        changedTasks = [
          ...tasks.slice(taskIndex + 1, anchorTaskIndex + 1),
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
    return TaskMoveResult.Success;
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
