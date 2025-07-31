import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '@/user/entity/user.entity';
import { InjectCurrentUser } from '@/auth/model';
import { TaskList } from './entity/task-list.entity';
import { Task } from './entity/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskListDto } from './dto/create-task-list.dto';
import { TaskMoveResult, TaskPosition } from './model';
import { RelativeReorderTaskDto, ReorderTaskDto } from './dto/reorder-task.dto';
import { MoveTaskDto, RelativeMoveTaskDto } from './dto/move-task.dto';
import { DEFAULT_TASK_ORDER, QueryTaskDto } from './dto/query-task.dto';
import { UserService } from '@/user/user.service';

@Injectable({ scope: Scope.REQUEST })
export class TaskService {
  constructor(
    @InjectRepository(TaskList) private taskListRepo: Repository<TaskList>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectCurrentUser() private user: () => User,
    private userService: UserService,
  ) {}

  private get userId() {
    return this.user().id;
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
    const { taskListId, order = DEFAULT_TASK_ORDER, users } = dto || {};
    const isAdmin = await this.userService.isAdmin(this.userId);

    const usersSpecified = !!users;
    const privilegedUsers = (users ?? []).filter(
      (user) => isAdmin || user === this.userId,
    );
    const creatorWhere = {
      creator: usersSpecified ? In(privilegedUsers) : { id: this.userId },
    };

    const getTaskListWhere = async () => {
      if (!taskListId) {
        return { privileged: true, where: {} };
      }

      const taskList = await this.taskListRepo.findOne({
        where: { id: taskListId },
      });

      const hasPermission = isAdmin || taskList?.creatorId === this.userId;
      if (hasPermission) {
        return {
          privileged: true,
          where: { taskList: { id: taskListId } },
        };
      }
      return { privileged: false, where: {} };
    };
    const { privileged, where: taskListWhere } = await getTaskListWhere();
    if (!privileged) {
      return [];
    }

    const tasks = await this.taskRepo.find({
      where: { ...creatorWhere, ...taskListWhere },
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

  private async getMoveToLastTasks(task: Task, dto: MoveTaskDto) {
    const lastTaskInList = await this.taskRepo.findOne({
      where: {
        taskList: { id: dto.taskListId },
        creator: { id: this.userId },
      },
      order: {
        order: 'DESC',
      },
    });

    task.taskList = { id: dto.taskListId } as TaskList;
    task.order = lastTaskInList ? lastTaskInList.order + 1 : 0;
    return [task];
  }

  private async getMoveToFirstTasks(task: Task, dto: MoveTaskDto) {
    const lastTaskInList = await this.taskRepo.findOne({
      where: {
        taskList: { id: dto.taskListId },
        creator: { id: this.userId },
      },
      order: {
        order: 'ASC',
      },
    });

    task.taskList = { id: dto.taskListId } as TaskList;
    task.order = lastTaskInList ? lastTaskInList.order - 1 : 0;
    return [task];
  }

  private async getMoveTaskAffectTasks(task: Task, dto: MoveTaskDto) {
    if (dto.position === TaskPosition.Last) {
      return this.getMoveToLastTasks(task, dto);
    }
    if (dto.position === TaskPosition.First) {
      return this.getMoveToFirstTasks(task, dto);
    }
    return this.getRelativeMoveAffectedTasks(task, dto as RelativeMoveTaskDto);
  }

  private async getRelativeMoveAffectedTasks(
    task: Task,
    dto: RelativeMoveTaskDto,
  ) {
    const allTasks = await this.taskRepo.find({
      where: {
        creator: { id: this.userId },
        taskList: { id: dto.taskListId },
      },
      order: { order: 'ASC' },
    });

    if (allTasks.length === 0) {
      task.order = 0;
      // move to list
      task.taskList = { ...task.taskList, id: dto.taskListId } as TaskList;
      return [task];
    }

    const anchorTask = await this.validateTask(dto.anchorTaskId);
    if (anchorTask.taskListId !== dto.taskListId) {
      throw new BadRequestException(
        `Anchor task with ID ${dto.anchorTaskId} is not in target task list with ID ${dto.taskListId}`,
      );
    }

    const anchorTaskIndex = allTasks.findIndex((t) => t.id === anchorTask.id);

    const insertionIndex =
      dto.position === TaskPosition.Before
        ? anchorTaskIndex
        : anchorTaskIndex + 1;

    // move to list
    task.taskList = { ...task.taskList, id: dto.taskListId } as TaskList;

    const { changedTasks, startOrder } = this.getFewerHalfTasks(
      task,
      allTasks,
      insertionIndex,
    );

    changedTasks.forEach((t, index) => {
      t.order = startOrder + index;
    });

    return changedTasks;
  }

  private getFewerHalfTasks(
    task: Task,
    allTasks: Task[],
    insertionIndex: number,
  ) {
    const aboveTasksCount = insertionIndex;
    const belowTasksCount = allTasks.length - aboveTasksCount;

    if (belowTasksCount <= aboveTasksCount) {
      return {
        changedTasks: [task, ...allTasks.slice(insertionIndex)],
        startOrder: allTasks[insertionIndex].order,
      };
    }

    return {
      changedTasks: [...allTasks.slice(0, insertionIndex), task],
      startOrder: allTasks[0].order - 1,
    };
  }

  /**
   * move task to another task list
   */
  async moveTask(taskId: number, dto: MoveTaskDto) {
    const task = await this.validateTask(taskId);
    if (task.taskListId === dto.taskListId) {
      return TaskMoveResult.AlreadyInPlace;
    }

    await this.validateTaskList(dto.taskListId);
    const affectedTasks = await this.getMoveTaskAffectTasks(task, dto);

    await this.taskRepo.save(affectedTasks);
    return TaskMoveResult.Success;
  }

  private async doReorder(
    taskId: number,
    options: {
      getAnchorTask: (task: Task) => Promise<Task | null>;
      isAlreadyInPlace: (task: Task, anchorTask: Task | null) => boolean;
      getAffectedTasks: (
        task: Task,
        anchorTask: Task | null,
      ) => Promise<Task[]>;
    },
  ) {
    const task = await this.validateTask(taskId);

    const { isAlreadyInPlace, getAffectedTasks, getAnchorTask } = options;

    const anchorTask = await getAnchorTask(task);
    if (isAlreadyInPlace(task, anchorTask)) {
      return TaskMoveResult.AlreadyInPlace;
    }

    const affectedTasks = await getAffectedTasks(task, anchorTask);
    await this.taskRepo.save(affectedTasks);

    return TaskMoveResult.Success;
  }

  private async doReorderAbsolutely(
    taskId: number,
    options: {
      getAnchorTask: (task: Task) => Promise<Task | null>;
      getNewOrder: (task: Task | null) => number;
    },
  ) {
    const { getAnchorTask, getNewOrder } = options;

    return this.doReorder(taskId, {
      getAnchorTask,
      isAlreadyInPlace: (task, anchorTask) => {
        return task.id === anchorTask?.id;
      },
      getAffectedTasks: (task, anchorTask) => {
        task.order = getNewOrder(anchorTask);
        return Promise.resolve([task]);
      },
    });
  }

  private async doReorderToFirst(taskId: number) {
    return this.doReorderAbsolutely(taskId, {
      getAnchorTask: async (task: Task) => {
        const lastTask = await this.taskRepo.findOne({
          where: {
            creator: { id: this.userId },
            taskList: { id: task.taskListId },
          },
          order: { order: 'ASC' },
        });
        return lastTask;
      },
      getNewOrder: (anchorTask: Task | null) => {
        return anchorTask ? anchorTask.order - 1 : 0;
      },
    });
  }

  private async doReorderToLast(taskId: number) {
    return this.doReorderAbsolutely(taskId, {
      getAnchorTask: async (task: Task) => {
        const lastTask = await this.taskRepo.findOne({
          where: {
            creator: { id: this.userId },
            taskList: { id: task.taskListId },
          },
          order: { order: 'DESC' },
        });
        return lastTask;
      },
      getNewOrder(anchorTask: Task) {
        return anchorTask ? anchorTask.order + 1 : 0;
      },
    });
  }

  private async doReorderRelatively(
    taskId: number,
    anchorTaskId: number,
    options: {
      isAlreadyInPlace: (task: Task, anchorTask: Task) => boolean;
      getChangedTasks: (data: {
        tasks: Task[];
        task: Task;
        taskOrder: number;
        taskIndex: number;
        anchorTaskOrder: number;
        anchorTaskIndex: number;
      }) => { changedTasks: Task[]; startOrder: number };
    },
  ) {
    const { isAlreadyInPlace, getChangedTasks } = options;
    return this.doReorder(taskId, {
      getAnchorTask: async () => {
        return this.validateTask(anchorTaskId);
      },
      isAlreadyInPlace: (task: Task, anchorTask: Task) => {
        const isSameTask = task.id === anchorTask?.id;
        return isSameTask || isAlreadyInPlace(task, anchorTask);
      },
      getAffectedTasks: async (task: Task, anchorTask: Task) => {
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

        const { changedTasks, startOrder } = getChangedTasks({
          tasks,
          task,
          taskOrder,
          taskIndex,
          anchorTaskOrder,
          anchorTaskIndex,
        });

        changedTasks.forEach((t, index) => {
          t.order = startOrder + index;
        });

        return changedTasks;
      },
    });
  }

  private doReorderToBefore(taskId: number, anchorTaskId: number) {
    return this.doReorderRelatively(taskId, anchorTaskId, {
      isAlreadyInPlace: (task, anchorTask) => {
        return task.order === anchorTask.order - 1;
      },
      getChangedTasks(data) {
        const {
          tasks,
          task,
          taskOrder,
          taskIndex,
          anchorTaskOrder,
          anchorTaskIndex,
        } = data;

        if (taskOrder > anchorTaskOrder) {
          return {
            changedTasks: [task, ...tasks.slice(anchorTaskIndex, taskIndex)],
            startOrder: anchorTaskOrder,
          };
        }

        if (taskOrder < anchorTaskOrder) {
          return {
            changedTasks: [
              ...tasks.slice(taskIndex + 1, anchorTaskIndex),
              task,
            ],
            startOrder: taskOrder,
          };
        }
        throw new ForbiddenException('Impossible case: task orders are equal');
      },
    });
  }

  private doReorderToAfter(taskId: number, anchorTaskId: number) {
    return this.doReorderRelatively(taskId, anchorTaskId, {
      isAlreadyInPlace: (task, anchorTask) => {
        return task.order === anchorTask.order + 1;
      },
      getChangedTasks(data) {
        const {
          tasks,
          task,
          taskOrder,
          taskIndex,
          anchorTaskOrder,
          anchorTaskIndex,
        } = data;

        if (taskOrder > anchorTaskOrder) {
          return {
            changedTasks: [
              task,
              ...tasks.slice(anchorTaskIndex + 1, taskIndex),
            ],
            startOrder: anchorTaskOrder + 1,
          };
        }

        if (taskOrder < anchorTaskOrder) {
          return {
            changedTasks: [
              ...tasks.slice(taskIndex + 1, anchorTaskIndex + 1),
              task,
            ],
            startOrder: taskOrder,
          };
        }
        throw new ForbiddenException('Impossible case: task orders are equal');
      },
    });
  }

  /**
   * reorder task to different position in same task list
   */
  async reorderTask(taskId: number, dto: ReorderTaskDto) {
    const strategies = {
      [TaskPosition.First]: () => this.doReorderToFirst(taskId),
      [TaskPosition.Last]: () => this.doReorderToLast(taskId),
      [TaskPosition.Before]: () =>
        this.doReorderToBefore(
          taskId,
          (dto as RelativeReorderTaskDto).anchorTaskId,
        ),
      [TaskPosition.After]: () =>
        this.doReorderToAfter(
          taskId,
          (dto as RelativeReorderTaskDto).anchorTaskId,
        ),
    };
    const strategy = strategies[dto.position];
    if (strategy) {
      return strategy();
    }

    throw new Error(`Invalid position ${dto.position}`);
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
