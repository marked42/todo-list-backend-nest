import { DataSource, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { User } from '@/core/entity/User';
import { CURRENT_USER } from '@/auth/model';
import { TaskService } from './TaskService';
import { TaskList } from '../entity/TaskList';
import { Task } from '../entity/Task';
import { TaskCreateRequest } from '../dto/TaskCreateRequest';
import { TaskUpdateRequest } from '../dto/TaskUpdateRequest';
import { TaskPosition, TaskReorderRequest } from '../dto/TaskReorderRequest';
import {
  TaskListStatus,
  TaskMoveResult,
  TaskOrder,
  TaskStatus,
} from '../model';
import { TaskMoveRequest } from '../dto/TaskMoveRequest';
import { TaskQueryParam } from '../dto/TaskQueryParam';

const getEntityId = (entity: { id: number }) => entity.id;

describe('TaskService', () => {
  let service: TaskService;
  let taskListRepo: Repository<TaskList>;
  let taskRepo: Repository<Task>;
  let userRepo: Repository<User>;
  let testDataSource: DataSource;
  let testingModule: TestingModule;

  type LazyTaskList = Omit<TaskList, 'creator'> & { creator: undefined };
  type LazyTask = Omit<Task, 'creator' | 'taskList'> & {
    creator: undefined;
    taskList: undefined;
  };
  const db = {
    users: [] as User[],

    _taskLists: [] as TaskList[],
    get taskLists() {
      return db._taskLists.map(({ creator: _, ...rest }) => {
        return {
          ...rest,
          creator: undefined,
        } as LazyTaskList;
      });
    },
    get taskListsWithTasks() {
      return db.taskLists.map((taskList) => {
        const tasks = db.ownedTasks.filter(
          (task) => task.taskListId === taskList.id,
        );
        return {
          ...taskList,
          tasks,
        } as LazyTaskList;
      });
    },
    get ownedTaskLists() {
      return db.taskLists.filter(ownedByCurrentUser);
    },
    get firstOwnedTaskList() {
      const taskList = db.ownedTaskLists[0];
      if (!taskList) {
        throw new Error('task list owned by current user not found');
      }
      return taskList;
    },
    get unownedTaskLists() {
      return db.taskLists.filter(unownedByCurrentUser);
    },
    get firstUnownedTaskList() {
      const taskList = db.unownedTaskLists[0];
      if (!taskList) {
        throw new Error('task list not owned by current user not found');
      }
      return taskList;
    },

    _tasks: [] as Task[],
    get tasks() {
      return db._tasks.map(
        ({ creator: _1, taskList: _2, ...rest }) =>
          ({
            ...rest,
            taskList: undefined,
            creator: undefined,
          }) as LazyTask,
      );
    },
    get ownedTasks() {
      return db.tasks.filter(ownedByCurrentUser);
    },
    get firstOwnedTask() {
      const task = db.ownedTasks[0];
      if (!task) {
        throw new Error('task owned by current user not found');
      }
      return task;
    },
    get unownedTasks() {
      return db.tasks.filter(unownedByCurrentUser);
    },
    get firstUnownedTask() {
      const task = db.unownedTasks[0];
      if (!task) {
        throw new Error('task not owned by current user not found');
      }
      return task;
    },
  };
  /**  user first db user as current user */
  const mockCurrentUser = {
    id: 1,
    name: 'User 1',
    encryptedPassword: 'pass1',
  };
  const ownedByCurrentUser = (entity: { creatorId: number }) =>
    entity.creatorId === mockCurrentUser.id;
  const unownedByCurrentUser = (entity: { creatorId: number }) =>
    entity.creatorId !== mockCurrentUser.id;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: ['src/todo/entity/*.ts', 'src/core/entity/*.ts'],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([Task, TaskList, User]),
      ],
      providers: [
        TaskService,
        {
          provide: CURRENT_USER,
          useValue: mockCurrentUser,
        },
      ],
    }).compile();

    service = await testingModule.resolve<TaskService>(TaskService);
    userRepo = testingModule.get<Repository<User>>(getRepositoryToken(User));
    taskListRepo = testingModule.get<Repository<TaskList>>(
      getRepositoryToken(TaskList),
    );
    taskRepo = testingModule.get<Repository<Task>>(getRepositoryToken(Task));
    testDataSource = testingModule.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await testDataSource.destroy();
    await testingModule.close();
  });

  beforeEach(async () => {
    db.users = userRepo.create([
      mockCurrentUser,
      {
        name: 'User 2',
        encryptedPassword: 'pass2',
      },
    ]);

    await userRepo.save(db.users);

    db._taskLists = taskListRepo.create([
      {
        name: 'TaskList 1',
        status: TaskListStatus.Active,
        creator: { id: db.users[0].id },
      },
      {
        name: 'TaskList 2 (empty)',
        status: TaskListStatus.Close,
        creator: { id: db.users[0].id },
      },
      {
        name: 'TaskList 3',
        status: TaskListStatus.Close,
        creator: { id: db.users[1].id },
      },
    ]);
    await taskListRepo.save(db._taskLists);

    db._tasks = taskRepo.create([
      // TaskList 1
      {
        name: 'Task 1',
        taskList: { id: db.taskLists[0].id },
        order: 0,
        creator: { id: db.users[0].id },
      },
      {
        name: 'Task 2',
        taskList: { id: db.taskLists[0].id },
        order: 1,
        creator: { id: db.users[0].id },
      },
      {
        name: 'Task 3',
        taskList: { id: db.taskLists[0].id },
        order: 2,
        creator: { id: db.users[0].id },
      },
      {
        name: 'Task 4',
        taskList: { id: db.taskLists[0].id },
        order: 3,
        creator: { id: db.users[0].id },
      },
      {
        name: 'Task 5',
        taskList: { id: db.taskLists[0].id },
        order: 4,
        creator: { id: db.users[0].id },
      },
      {
        name: 'Task 6',
        taskList: { id: db.taskLists[0].id },
        order: 5,
        creator: { id: db.users[0].id },
      },
      // TaskList 3
      {
        name: 'Task 7',
        taskList: { id: db.taskLists[2].id },
        order: 0,
        creator: { id: db.users[1].id },
      },
      {
        name: 'Task 8',
        taskList: { id: db.taskLists[2].id },
        order: 1,
        creator: { id: db.users[1].id },
      },
      {
        name: 'Task 9',
        taskList: { id: db.taskLists[2].id },
        order: 2,
        creator: { id: db.users[1].id },
      },
      {
        name: 'Task 10',
        taskList: { id: db.taskLists[2].id },
        order: 2,
        creator: { id: db.users[1].id },
      },
    ]);

    await taskRepo.save(db._tasks);
  });

  afterEach(async () => {
    // forces to drop all tables using 'true'
    await testDataSource.synchronize(true);
    jest.clearAllMocks();
  });

  describe('task list', () => {
    describe('getTaskLists', () => {
      it('should return task list of current user', async () => {
        const result = await service.getTaskLists();
        expect(result).toEqual(db.ownedTaskLists);
      });
    });

    describe('createTaskList', () => {
      it('should create a task list', async () => {
        const request = new TaskCreateRequest();
        request.name = 'TaskList 4';
        const result = await service.createTaskList(request);

        const expectedResult = expect.objectContaining({
          name: 'TaskList 4',
          creatorId: mockCurrentUser.id,
        }) as jest.Expect;
        expect(result).toEqual(expectedResult);

        const allTaskLists = await taskListRepo.findBy({
          creator: { id: mockCurrentUser.id },
        });
        expect(allTaskLists).toContainEqual(expectedResult);
      });
    });

    describe('deleteTaskList', () => {
      it('should delete a task list', async () => {
        const taskListId = db.firstOwnedTaskList.id;
        const otherTasks = db.ownedTaskLists.filter(
          (taskList) => taskList.id !== taskListId,
        );

        await service.deleteTaskList(taskListId);
        const remainingTasks = await taskListRepo.findBy({
          creator: { id: mockCurrentUser.id },
        });

        expect(remainingTasks).toEqual(otherTasks);
      });

      it('should throw NotFoundException when deleting a non-existent task list', async () => {
        const nonExistTaskListId = -1;
        await expect(
          service.deleteTaskList(nonExistTaskListId),
        ).rejects.toThrow(`Task list with ID ${nonExistTaskListId} not found`);
      });

      it('should throw ForbiddenException when deleting a task list that is not owned by the user', async () => {
        const taskListToBeDeleted = db.firstUnownedTaskList;
        await expect(
          service.deleteTaskList(taskListToBeDeleted.id),
        ).rejects.toThrow(
          `Task list with ID ${taskListToBeDeleted.id} not owned by user ${mockCurrentUser.id}`,
        );
      });
    });

    describe('renameTaskList', () => {
      it('should rename a task list', async () => {
        const taskList = db.firstOwnedTaskList;
        const newName = 'New List';
        await service.renameTaskList(taskList.id, newName);
        const updatedTaskList = await taskListRepo.findOneBy({
          id: taskList.id,
          creator: { id: mockCurrentUser.id },
        });
        expect(updatedTaskList?.name).toEqual(newName);
      });

      it('should throw NotFoundException when renaming a non-existent task list', async () => {
        const nonExistTaskListId = -1;
        const newName = 'New List';
        await expect(service.renameTaskList(-1, newName)).rejects.toThrow(
          `Task list with ID ${nonExistTaskListId} not found`,
        );
      });

      it('should throw ForbiddenException when renaming a task list not owned by user', async () => {
        const taskListId = db.firstUnownedTaskList.id;
        const newName = 'Renamed List';
        await expect(
          service.renameTaskList(taskListId, newName),
        ).rejects.toThrow(
          `Task list with ID ${taskListId} not owned by user ${mockCurrentUser.id}`,
        );
      });
    });
  });

  describe('task', () => {
    describe('getTasks', () => {
      it('should return tasks in given task list owned by current user in ascending order by default', async () => {
        const taskListId = db.firstOwnedTaskList.id;
        const userTasksInList = db.tasks.filter(
          (task) => ownedByCurrentUser(task) && task.taskListId === taskListId,
        );
        const param = new TaskQueryParam();
        param.taskListId = taskListId;

        const tasks = await service.getTasks(param);

        expect(tasks).toBeSorted({ key: 'order' });

        expect(tasks.length).toEqual(userTasksInList.length);
        expect(tasks.map(getEntityId)).toEqual(
          userTasksInList.map(getEntityId),
        );
      });

      it('should return tasks in given task list owned by current user in descending order', async () => {
        const taskListId = db.firstOwnedTaskList.id;
        const userTasksInList = db.tasks.filter(
          (task) => ownedByCurrentUser(task) && task.taskListId === taskListId,
        );
        const param = new TaskQueryParam();
        param.taskListId = taskListId;
        param.order = TaskOrder.DESC;

        const tasks = await service.getTasks(param);

        expect(tasks).toBeSorted({ key: 'order', descending: true });

        expect(tasks.length).toEqual(userTasksInList.length);
        expect(new Set(tasks.map(getEntityId))).toEqual(
          new Set(userTasksInList.map(getEntityId)),
        );
      });

      it('should return all tasks owned by current user', async () => {
        const tasks = await service.getTasks();
        expect(tasks.length).toEqual(db.ownedTasks.length);
        expect(tasks.map(getEntityId)).toEqual(db.ownedTasks.map(getEntityId));
      });

      it('should throw error for a given task list not owned by current user', async () => {
        const param = new TaskQueryParam();
        param.taskListId = db.firstUnownedTaskList.id;

        await expect(service.getTasks(param)).rejects.toThrow(
          `Task list with ID ${param.taskListId} not owned by user ${mockCurrentUser.id}`,
        );
      });
    });

    describe('createTask', () => {
      it('should create a task with default order 0 in an empty list', async () => {
        const emptyTaskList = db.ownedTaskLists.find((taskList) =>
          db.ownedTasks.every((task) => task.taskListId !== taskList.id),
        );
        if (!emptyTaskList) {
          throw new Error('no owned empty task list found');
        }

        const taskListId = emptyTaskList.id;
        const request = { name: 'New Task', taskListId } as TaskCreateRequest;

        const result = await service.createTask(request);

        expect(result.order).toEqual(0);
      });

      it('should create a task at last place in list', async () => {
        const taskListId = db.firstOwnedTaskList.id;
        const request = { name: 'New Task', taskListId } as TaskCreateRequest;

        const result = await service.createTask(request);

        const tasksInList = db.tasks.filter(
          (task) => task.taskListId === taskListId,
        );
        const orders = tasksInList.map((task) => task.order);
        const newOrder = orders.length > 0 ? Math.max(...orders) + 1 : 0;

        const expectedResult = expect.objectContaining({
          name: request.name,
          order: newOrder,
          taskListId: taskListId,
          creatorId: mockCurrentUser.id,
        }) as jest.Expect;
        expect(result).toEqual(expectedResult);

        const allTasks = await taskRepo.findBy({
          taskList: { id: taskListId },
          creator: { id: mockCurrentUser.id },
        });
        expect(allTasks).toContainEqual(expectedResult);
      });

      it('should throw NotFoundException when creating a task for a non-existent task list', async () => {
        const taskListId = -1;
        const request = { name: 'New Task', taskListId } as TaskCreateRequest;
        await expect(service.createTask(request)).rejects.toThrow(
          `Task list with ID ${taskListId} not found`,
        );
      });

      it('should throw ForbiddenException when creating a task for a task list not owned by user', async () => {
        const taskList = db.firstUnownedTaskList;
        const request = {
          name: 'New Task',
          taskListId: taskList.id,
        } as TaskCreateRequest;
        await expect(service.createTask(request)).rejects.toThrow(
          `Task list with ID ${taskList.id} not owned by user ${mockCurrentUser.id}`,
        );
      });
    });

    describe('deleteTask', () => {
      it('should delete a task', async () => {
        const taskId = db.firstOwnedTask.id;
        const otherOwnedTasks = db.ownedTasks.filter(
          (task) => ownedByCurrentUser(task) && task.id !== taskId,
        );

        await service.deleteTask(taskId);

        const remainingTasks = await taskRepo.findBy({
          creator: { id: mockCurrentUser.id },
        });
        expect(remainingTasks).toEqual(otherOwnedTasks);
      });

      it('should throw NotFoundException when deleting a non-existent task', async () => {
        const taskId = -1;
        await expect(service.deleteTask(taskId)).rejects.toThrow(
          `Task with ID ${taskId} not found`,
        );
      });

      it('should throw ForbiddenException when deleting a task not owned by user', async () => {
        const taskId = db.firstUnownedTask.id;
        await expect(service.deleteTask(taskId)).rejects.toThrow(
          `Task with ID ${taskId} not owned by user ${mockCurrentUser.id}`,
        );
      });
    });

    describe('updateTask', () => {
      const updateData = {
        name: 'Updated Task',
        content: 'Updated content',
        status: TaskStatus.Done,
      } as TaskUpdateRequest;

      it('should update a task', async () => {
        const taskId = db.firstOwnedTask.id;

        const result = await service.updateTask(taskId, updateData);
        expect(result).toEqual(
          expect.objectContaining({
            id: taskId,
            ...updateData,
          }),
        );
      });

      it('should throw NotFoundException when updating a non-existent task', async () => {
        const taskId = -1;
        await expect(service.updateTask(taskId, updateData)).rejects.toThrow(
          `Task with ID ${taskId} not found`,
        );
      });

      it('should throw ForbiddenException when updating a task not owned by user', async () => {
        const taskId = db.firstUnownedTask.id;
        await expect(service.updateTask(taskId, updateData)).rejects.toThrow(
          `Task with ID ${taskId} not owned by user ${mockCurrentUser.id}`,
        );
      });
    });

    describe('move task to another task list', () => {
      it('should move a task to another task list', async () => {
        const { id: taskId, taskListId } = db.firstOwnedTask;

        const anotherUserTaskList = db.ownedTaskLists.find(
          (taskList) => taskList.id !== taskListId,
        );
        if (!anotherUserTaskList) {
          throw new Error('user has no another task list');
        }

        const request = new TaskMoveRequest();
        request.taskListId = anotherUserTaskList.id;

        const result = await service.moveTask(taskId, request);
        expect(result).toEqual(TaskMoveResult.Success);

        const lastTask = await taskRepo.findOne({
          where: {
            taskList: { id: request.taskListId },
            creator: { id: mockCurrentUser.id },
          },
          order: {
            order: 'DESC',
          },
        });
        if (!lastTask) {
          throw new Error('last task not found');
        }

        expect(lastTask.id).toEqual(taskId);
        expect(lastTask.taskListId).toEqual(anotherUserTaskList.id);
      });

      it('should not move a task if it is already in the target task list', async () => {
        const { id: taskId, taskListId } = db.firstOwnedTask;
        const request = new TaskMoveRequest();
        request.taskListId = taskListId;

        const result = await service.moveTask(taskId, request);
        expect(result).toEqual(TaskMoveResult.AlreadyInPlace);
      });

      it('should throw NotFoundException when moving a non-existent task', async () => {
        const taskId = -1;
        const request = new TaskMoveRequest();
        request.taskListId = 3;
        await expect(service.moveTask(taskId, request)).rejects.toThrow(
          `Task with ID ${taskId} not found`,
        );
      });

      it('should throw ForbiddenException when moving a task not owned by user', async () => {
        const { id: taskId } = db.firstUnownedTask;
        const request = new TaskMoveRequest();
        request.taskListId = -1;
        await expect(service.moveTask(taskId, request)).rejects.toThrow(
          `Task with ID ${taskId} not owned by user ${mockCurrentUser.id}`,
        );
      });

      it('should throw NotFoundException when moving to a non-existent task list', async () => {
        const { id: taskId } = db.firstOwnedTask;
        const request = new TaskMoveRequest();
        request.taskListId = -1;
        await expect(service.moveTask(taskId, request)).rejects.toThrow(
          `Task list with ID ${request.taskListId} not found`,
        );
      });

      it('should throw ForbiddenException when moving to a task list not owned by user', async () => {
        const { id: taskId } = db.firstOwnedTask;
        const request = new TaskMoveRequest();
        request.taskListId = db.firstUnownedTaskList.id;
        await expect(service.moveTask(taskId, request)).rejects.toThrow(
          `Task list with ID ${request.taskListId} not owned by user ${mockCurrentUser.id}`,
        );
      });
    });

    describe('reorder a task', () => {
      describe('reorder task to absolute position', () => {
        describe('reorder task to first place', () => {
          it('should move a task to first place', async () => {
            const task = db.ownedTasks[Math.floor(db.ownedTasks.length / 2)];

            const request = new TaskReorderRequest();
            request.position = TaskPosition.First;

            const result = await service.reorderTask(task.id, request);
            expect(result).toEqual(TaskMoveResult.Success);

            const firstTask = await taskRepo.findOne({
              where: {
                taskList: { id: task.taskListId },
                creator: { id: mockCurrentUser.id },
              },
              order: { order: 'ASC' },
            });
            if (!firstTask) {
              throw new Error('first task in task list not found');
            }

            expect(firstTask.id).toEqual(task.id);
          });

          it('should do nothing when already in place (moving first task)', async () => {
            const task = db.ownedTasks[0];

            const request = new TaskReorderRequest();
            request.position = TaskPosition.First;

            const result = await service.reorderTask(task.id, request);
            expect(result).toEqual(TaskMoveResult.AlreadyInPlace);

            const firstTask = await taskRepo.findOne({
              where: {
                taskList: { id: task.taskListId },
                creator: { id: mockCurrentUser.id },
              },
              order: { order: 'ASC' },
            });
            if (!firstTask) {
              throw new Error('first task in task list not found');
            }

            expect(firstTask.id).toEqual(task.id);
            expect(firstTask.order).toEqual(task.order);
          });

          it('should throw NotFoundException when moving non-exist task', async () => {
            const nonExistId = -1;
            const request = new TaskReorderRequest();
            request.position = TaskPosition.First;
            await expect(
              service.reorderTask(nonExistId, request),
            ).rejects.toThrow(
              new NotFoundException(`Task with ID ${nonExistId} not found`),
            );
          });

          it('should throw ForbiddenException when moving unowned task', async () => {
            const task = db.firstUnownedTask;
            const request = new TaskReorderRequest();
            request.position = TaskPosition.First;
            await expect(service.reorderTask(task.id, request)).rejects.toThrow(
              new ForbiddenException(
                `Task with ID ${task.id} not owned by user ${mockCurrentUser.id}`,
              ),
            );
          });
        });

        describe('reorder task to last place', () => {
          it('should move a task to last place', async () => {
            const task = db.ownedTasks[Math.floor(db.ownedTasks.length / 2)];

            const request = new TaskReorderRequest();
            request.position = TaskPosition.Last;

            const result = await service.reorderTask(task.id, request);
            expect(result).toEqual(TaskMoveResult.Success);

            const lastTask = await taskRepo.findOne({
              where: {
                taskList: { id: task.taskListId },
                creator: { id: mockCurrentUser.id },
              },
              order: { order: 'DESC' },
            });
            if (!lastTask) {
              throw new Error('first task in task list not found');
            }

            expect(lastTask.id).toEqual(task.id);
          });

          it('should do nothing when already in place (moving last task)', async () => {
            const task = db.ownedTasks[db.ownedTasks.length - 1];

            const request = new TaskReorderRequest();
            request.position = TaskPosition.Last;

            const result = await service.reorderTask(task.id, request);
            expect(result).toEqual(TaskMoveResult.AlreadyInPlace);

            const lastTask = await taskRepo.findOne({
              where: {
                taskList: { id: task.taskListId },
                creator: { id: mockCurrentUser.id },
              },
              order: { order: 'DESC' },
            });
            if (!lastTask) {
              throw new Error('last task in task list not found');
            }

            expect(lastTask.id).toEqual(task.id);
            expect(lastTask.order).toEqual(task.order);
          });

          it('should throw NotFoundException when moving non-exist task', async () => {
            const nonExistId = -1;
            const request = new TaskReorderRequest();
            request.position = TaskPosition.Last;
            await expect(
              service.reorderTask(nonExistId, request),
            ).rejects.toThrow(
              new NotFoundException(`Task with ID ${nonExistId} not found`),
            );
          });

          it('should throw ForbiddenException when moving unowned task', async () => {
            const task = db.firstUnownedTask;
            const request = new TaskReorderRequest();
            request.position = TaskPosition.Last;
            await expect(service.reorderTask(task.id, request)).rejects.toThrow(
              new ForbiddenException(
                `Task with ID ${task.id} not owned by user ${mockCurrentUser.id}`,
              ),
            );
          });
        });
      });

      describe('reorder task to relative position', () => {
        const expectCorrectOrderAfterMoved = async (
          taskListId: number,
          beforeId: number,
          nextId: number,
        ) => {
          const allTasks = await taskRepo.find({
            where: {
              creator: { id: mockCurrentUser.id },
              taskList: { id: taskListId },
            },
            order: {
              order: 'ASC',
            },
          });

          expect(allTasks).toBeSorted({ key: 'order' });
          const beforeTask = allTasks.find((t) => t.id === beforeId);
          const nextTask = allTasks.find((t) => t.id === nextId);

          if (!beforeTask || !nextTask) {
            throw new Error('task or target task not found after moved');
          }
          expect(beforeTask.order + 1).toEqual(nextTask.order);
        };

        describe('reorder task before', () => {
          it('should move correctly when target task has larger order', async () => {
            const taskList = db.taskListsWithTasks[0];
            const task = taskList.tasks[0];
            const targetTask = taskList.tasks[taskList.tasks.length - 1];

            const request = new TaskReorderRequest();
            request.position = TaskPosition.Before;
            request.anchorTaskId = targetTask.id;

            const result = await service.reorderTask(task.id, request);
            expect(result).toEqual(TaskMoveResult.Success);

            await expectCorrectOrderAfterMoved(
              taskList.id,
              task.id,
              targetTask.id,
            );
          });

          it('should move correctly when target task has smaller order', async () => {
            const taskList = db.taskListsWithTasks[0];
            const task = taskList.tasks[taskList.tasks.length - 1];
            const targetTask = taskList.tasks[0];

            const request = new TaskReorderRequest();
            request.position = TaskPosition.Before;
            request.anchorTaskId = targetTask.id;

            const result = await service.reorderTask(task.id, request);
            expect(result).toEqual(TaskMoveResult.Success);

            await expectCorrectOrderAfterMoved(
              taskList.id,
              task.id,
              targetTask.id,
            );
          });

          it('should do nothing when already in place (relative task is the task to move)', async () => {
            const task = db.ownedTasks[Math.floor(db.ownedTasks.length / 2)];

            const request = new TaskReorderRequest();
            request.position = TaskPosition.Before;
            // same task
            request.anchorTaskId = task.id;

            const result = await service.reorderTask(task.id, request);
            expect(result).toEqual(TaskMoveResult.AlreadyInPlace);
          });

          it('should do nothing when already in place (reorder task before its next task)', async () => {
            const [task, nextTask] = db.ownedTasks;
            if (!task || !nextTask) {
              throw new Error('no consecutive tasks');
            }

            const request = new TaskReorderRequest();
            request.position = TaskPosition.Before;
            // same task
            request.anchorTaskId = nextTask.id;

            const result = await service.reorderTask(task.id, request);
            expect(result).toEqual(TaskMoveResult.AlreadyInPlace);
          });

          it('should throw NotFoundException when moving non-exist task', async () => {
            const nonExistId = -1;
            const targetTask = db.firstOwnedTask;
            const request = new TaskReorderRequest();
            request.position = TaskPosition.Before;
            request.anchorTaskId = targetTask.id;

            await expect(
              service.reorderTask(nonExistId, request),
            ).rejects.toThrow(
              new NotFoundException(`Task with ID ${nonExistId} not found`),
            );
          });

          it('should throw ForbiddenException when moving unowned task', async () => {
            const task = db.firstUnownedTask;
            const request = new TaskReorderRequest();
            request.position = TaskPosition.Before;
            request.anchorTaskId = db.firstOwnedTask.id;

            await expect(service.reorderTask(task.id, request)).rejects.toThrow(
              new ForbiddenException(
                `Task with ID ${task.id} not owned by user ${mockCurrentUser.id}`,
              ),
            );
          });

          it('should throw NotFoundException when target task not exist', async () => {
            const taskId = db.firstOwnedTask.id;

            const nonExistId = -1;
            const request = new TaskReorderRequest();
            request.position = TaskPosition.Before;
            request.anchorTaskId = nonExistId;

            await expect(service.reorderTask(taskId, request)).rejects.toThrow(
              new NotFoundException(`Task with ID ${nonExistId} not found`),
            );
          });

          it('should throw ForbiddenException when target task unowned', async () => {
            const task = db.firstOwnedTask;
            const request = new TaskReorderRequest();
            request.position = TaskPosition.Before;
            request.anchorTaskId = db.firstUnownedTask.id;

            await expect(service.reorderTask(task.id, request)).rejects.toThrow(
              new ForbiddenException(
                `Task with ID ${request.anchorTaskId} not owned by user ${mockCurrentUser.id}`,
              ),
            );
          });
        });

        describe('reorder task after', () => {
          it('should move correctly when target task has larger order', async () => {
            const taskList = db.taskListsWithTasks[0];
            const task = taskList.tasks[0];
            const targetTask = taskList.tasks[taskList.tasks.length - 1];

            const request = new TaskReorderRequest();
            request.position = TaskPosition.After;
            request.anchorTaskId = targetTask.id;

            const result = await service.reorderTask(task.id, request);
            expect(result).toEqual(TaskMoveResult.Success);

            await expectCorrectOrderAfterMoved(
              taskList.id,
              targetTask.id,
              task.id,
            );
          });

          it('should move correctly when target task has smaller order', async () => {
            const taskList = db.taskListsWithTasks[0];
            const task = taskList.tasks[taskList.tasks.length - 1];
            const targetTask = taskList.tasks[0];

            const request = new TaskReorderRequest();
            request.position = TaskPosition.After;
            request.anchorTaskId = targetTask.id;

            const result = await service.reorderTask(task.id, request);
            expect(result).toEqual(TaskMoveResult.Success);

            await expectCorrectOrderAfterMoved(
              taskList.id,
              targetTask.id,
              task.id,
            );
          });

          it('should do nothing when already in place (relative task is the task to move)', async () => {
            const task = db.ownedTasks[Math.floor(db.ownedTasks.length / 2)];

            const request = new TaskReorderRequest();
            request.position = TaskPosition.After;
            // same task
            request.anchorTaskId = task.id;

            const result = await service.reorderTask(task.id, request);
            expect(result).toEqual(TaskMoveResult.AlreadyInPlace);
          });

          it('should do nothing when already in place (reorder task after its previous task)', async () => {
            const [previousTask, task] = db.ownedTasks;
            if (!task || !previousTask) {
              throw new Error('no consecutive tasks');
            }

            const request = new TaskReorderRequest();
            request.position = TaskPosition.After;
            // same task
            request.anchorTaskId = previousTask.id;

            const result = await service.reorderTask(task.id, request);
            expect(result).toEqual(TaskMoveResult.AlreadyInPlace);
          });

          it('should throw NotFoundException when moving non-exist task', async () => {
            const nonExistId = -1;
            const targetTask = db.firstOwnedTask;
            const request = new TaskReorderRequest();
            request.position = TaskPosition.After;
            request.anchorTaskId = targetTask.id;

            await expect(
              service.reorderTask(nonExistId, request),
            ).rejects.toThrow(
              new NotFoundException(`Task with ID ${nonExistId} not found`),
            );
          });

          it('should throw ForbiddenException when moving unowned task', async () => {
            const task = db.firstUnownedTask;
            const request = new TaskReorderRequest();
            request.position = TaskPosition.After;
            request.anchorTaskId = db.firstOwnedTask.id;

            await expect(service.reorderTask(task.id, request)).rejects.toThrow(
              new ForbiddenException(
                `Task with ID ${task.id} not owned by user ${mockCurrentUser.id}`,
              ),
            );
          });

          it('should throw NotFoundException when moving task', async () => {
            const taskId = db.firstOwnedTask.id;

            const nonExistId = -1;
            const request = new TaskReorderRequest();
            request.position = TaskPosition.After;
            request.anchorTaskId = nonExistId;

            await expect(service.reorderTask(taskId, request)).rejects.toThrow(
              new NotFoundException(`Task with ID ${nonExistId} not found`),
            );
          });

          it('should throw ForbiddenException when target task unowned', async () => {
            const task = db.firstOwnedTask;
            const request = new TaskReorderRequest();
            request.position = TaskPosition.After;
            request.anchorTaskId = db.firstUnownedTask.id;

            await expect(service.reorderTask(task.id, request)).rejects.toThrow(
              new ForbiddenException(
                `Task with ID ${request.anchorTaskId} not owned by user ${mockCurrentUser.id}`,
              ),
            );
          });
        });
      });
    });
  });
});
