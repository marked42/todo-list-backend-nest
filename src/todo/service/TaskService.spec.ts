import { DataSource, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@/core/entity/User';
import { TaskService } from './TaskService';
import { TaskList } from '../entity/TaskList';
import { Task } from '../entity/Task';
import { TaskCreateRequest } from '../dto/TaskCreateRequest';
import { TaskUpdateRequest } from '../dto/TaskUpdateRequest';
import { CURRENT_USER } from '@/auth/const';
import { TaskStatus } from '../enum/TaskStatus';
import { TaskListStatus } from '../enum/TaskListStatus';
import { MoveTaskResult } from '../enum/MoveTaskResult';

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
      return db._taskLists.map(
        ({ creator: _, ...rest }) =>
          ({
            ...rest,
            creator: undefined,
          }) as LazyTaskList,
      );
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
        name: 'TaskList 2',
        status: TaskListStatus.Close,
        creator: { id: db.users[1].id },
      },
      {
        name: 'TaskList 3',
        status: TaskListStatus.Close,
        creator: { id: db.users[0].id },
      },
    ]);
    await taskListRepo.save(db._taskLists);

    db._tasks = taskRepo.create([
      {
        name: 'Task 1',
        taskList: { id: db.taskLists[0].id },
        status: TaskStatus.Todo,
        creator: { id: db.users[0].id },
      },
      {
        name: 'Task 2',
        taskList: { id: db.taskLists[1].id },
        status: TaskStatus.Done,
        creator: { id: db.users[1].id },
      },
      {
        name: 'Task 3',
        taskList: { id: db.taskLists[2].id },
        status: TaskStatus.Todo,
        creator: { id: db.users[0].id },
      },
      {
        name: 'Task 4',
        taskList: { id: db.taskLists[0].id },
        status: TaskStatus.Done,
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

        const allTaskLists = await taskListRepo.findBy({});
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
      it('should return tasks in given task list owned by current user', async () => {
        const taskListId = db.firstOwnedTaskList.id;
        const userTasksInList = db.tasks.filter(
          (task) => ownedByCurrentUser(task) && task.taskListId === taskListId,
        );
        const tasks = await service.getTasks(taskListId);
        expect(tasks.length).toEqual(userTasksInList.length);
        expect(tasks.map(getEntityId)).toEqual(
          userTasksInList.map(getEntityId),
        );
      });

      it('should return all tasks owned by current user', async () => {
        const tasks = await service.getTasks();
        expect(tasks.length).toEqual(db.ownedTasks.length);
        expect(tasks.map(getEntityId)).toEqual(db.ownedTasks.map(getEntityId));
      });

      it('should throw error for a given task list not owned by current user', async () => {
        const taskListId = db.firstUnownedTaskList.id;
        await expect(service.getTasks(taskListId)).rejects.toThrow(
          `Task list with ID ${taskListId} not owned by user ${mockCurrentUser.id}`,
        );
      });
    });

    describe('createTask', () => {
      it('should create a task', async () => {
        const taskListId = db.taskLists[0].id;
        const request = { name: 'New Task', taskListId } as TaskCreateRequest;
        const expectedResult = expect.objectContaining({
          name: request.name,
          taskListId: taskListId,
          creatorId: mockCurrentUser.id,
        }) as jest.Expect;

        const result = await service.createTask(request);
        expect(result).toEqual(expectedResult);

        const allTasks = await taskRepo.findBy({});
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

        const otherTaskList = db.ownedTaskLists.find(
          (taskList) => taskList.id !== taskListId,
        );
        if (!otherTaskList) {
          throw new Error('user has no other task list');
        }

        const result = await service.moveToAnotherTaskList(
          taskId,
          otherTaskList.id,
        );
        expect(result).toEqual(MoveTaskResult.Moved);

        const task = await taskRepo.findOneBy({ id: taskId });
        if (!task) {
          throw new Error('task not found');
        }
        expect(task.taskListId).toEqual(otherTaskList.id);
      });

      it('should not move a task if it is already in the target task list', async () => {
        const { id: taskId, taskListId } = db.firstOwnedTask;

        const result = await service.moveToAnotherTaskList(taskId, taskListId);
        expect(result).toEqual(MoveTaskResult.AlreadyInList);
      });

      it('should throw NotFoundException when moving a non-existent task', async () => {
        const taskId = -1;
        const newTaskListId = 3;
        await expect(
          service.moveToAnotherTaskList(taskId, newTaskListId),
        ).rejects.toThrow(`Task with ID ${taskId} not found`);
      });

      it('should throw ForbiddenException when moving a task not owned by user', async () => {
        const { id: taskId } = db.firstUnownedTask;
        const newTaskListId = -1;
        await expect(
          service.moveToAnotherTaskList(taskId, newTaskListId),
        ).rejects.toThrow(
          `Task with ID ${taskId} not owned by user ${mockCurrentUser.id}`,
        );
      });

      it('should throw NotFoundException when moving to a non-existent task list', async () => {
        const { id: taskId } = db.firstOwnedTask;
        const newTaskListId = -1;
        await expect(
          service.moveToAnotherTaskList(taskId, newTaskListId),
        ).rejects.toThrow(`Task list with ID ${newTaskListId} not found`);
      });

      it('should throw ForbiddenException when moving to a task list not owned by user', async () => {
        const { id: taskId } = db.firstOwnedTask;
        const { id: newTaskListId } = db.firstUnownedTaskList;
        await expect(
          service.moveToAnotherTaskList(taskId, newTaskListId),
        ).rejects.toThrow(
          `Task list with ID ${newTaskListId} not owned by user ${mockCurrentUser.id}`,
        );
      });
    });
  });
});
