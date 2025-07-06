import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './TaskService';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@/core/entity/User';
import { TaskList } from '../entity/TaskList';
import { Task } from '../entity/Task';
import { TaskCreateRequest } from '../dto/TaskCreateRequest';
import { TaskUpdateRequest } from '../dto/TaskUpdateRequest';

describe('TaskService', () => {
  let service: TaskService;
  let taskListRepo: Repository<TaskList>;
  let taskRepo: Repository<Task>;

  beforeEach(async () => {
    // TODO: need a mock util
    const taskListRepoMock = {
      save: jest.fn(),
      delete: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const taskRepoMock = {
      save: jest.fn(),
      delete: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(TaskList),
          useValue: taskListRepoMock,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: taskRepoMock,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskListRepo = module.get<Repository<TaskList>>(
      getRepositoryToken(TaskList),
    );
    taskRepo = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('task list', () => {
    describe('getTaskLists', () => {
      it('should return an all task list if no userId is provided', async () => {
        const allTaskLists = [] as TaskList[];
        const find = jest
          .spyOn(taskListRepo, 'find')
          .mockResolvedValue(allTaskLists);

        const result = await service.getTaskLists();
        expect(find).toHaveBeenCalledWith({
          where: { createdBy: { userId: undefined } },
          // TODO: remove all relations options in test
          relations: ['createdBy'],
        });

        expect(result).toEqual(allTaskLists);
      });

      it('should return task lists for a given userId', async () => {
        const mockUserId = 1;
        const task1 = new TaskList();
        task1.createdBy = { id: 1 } as User;
        const task2 = new TaskList();
        task2.createdBy = { id: 2 } as User;

        const mockTaskLists = [task1, task2];

        const getTaskLists = jest
          .spyOn(taskListRepo, 'find')
          .mockImplementation(() => {
            return Promise.resolve(
              mockTaskLists.filter((task) => task.createdBy?.id === mockUserId),
            );
          });

        const result = await service.getTaskLists(mockUserId);
        expect(getTaskLists).toHaveBeenCalledWith({
          where: { createdBy: { id: mockUserId } },
          relations: ['createdBy'],
        });
        expect(result).toEqual([task1]);
      });
    });

    describe('createTaskList', () => {
      it('should create a task list', async () => {
        const taskList = { id: 1, name: 'Test List' } as TaskList;

        const save = jest
          .spyOn(taskListRepo, 'save')
          .mockResolvedValue(taskList);

        const result = await service.createTaskList(taskList);

        expect(save).toHaveBeenCalledWith(taskList);
        expect(result).toEqual(taskList);
      });
    });

    describe('deleteTaskList', () => {
      it('should delete a task list', async () => {
        const taskListId = 1;
        const userId = 2;
        const deleteResult = { affected: 1, raw: {} };

        const findOne = jest.spyOn(taskListRepo, 'findOne').mockResolvedValue({
          id: taskListId,
          createdBy: { id: userId },
        } as TaskList);

        const repoDelete = jest
          .spyOn(taskListRepo, 'delete')
          .mockResolvedValue(deleteResult);

        await service.deleteTaskList(taskListId, userId);

        expect(findOne).toHaveBeenCalledWith({
          where: { id: taskListId },
          relations: ['createdBy'],
        });
        expect(repoDelete).toHaveBeenCalledWith(taskListId);
      });

      it('should throw NotFoundException when deleting a non-existent task list', async () => {
        const taskListId = 1;
        const userId = 2;
        const deleteResult = { affected: 0, raw: {} };

        const findOne = jest
          .spyOn(taskListRepo, 'findOne')
          .mockResolvedValue(null);
        const taskListRepoDelete = jest
          .spyOn(taskListRepo, 'delete')
          .mockResolvedValue(deleteResult);

        await expect(
          service.deleteTaskList(taskListId, userId),
        ).rejects.toThrow(`Task list with ID ${taskListId} not found`);
        expect(findOne).toHaveBeenCalledWith({
          where: { id: taskListId },
          relations: ['createdBy'],
        });
        expect(taskListRepoDelete).not.toHaveBeenCalled();
      });
    });

    describe('renameTaskList', () => {
      it('should rename a task list', async () => {
        const taskListId = 1;
        const userId = 2;
        const oldName = 'Old List';
        const newName = 'New List';
        const oldTaskList = {
          id: taskListId,
          name: oldName,
          createdBy: { id: userId },
        } as TaskList;
        const newTaskList = { id: taskListId, name: newName } as TaskList;

        // 注意这里mock返回值应该是拷贝副本，否则在 save方法中oldTaskList.name 会被修改
        jest
          .spyOn(taskListRepo, 'findOne')
          .mockResolvedValue({ ...oldTaskList });
        const save = jest
          .spyOn(taskListRepo, 'save')
          .mockResolvedValue(newTaskList);

        const result = await service.renameTaskList(
          taskListId,
          userId,
          newName,
        );

        expect(save).toHaveBeenCalledWith({ ...oldTaskList, name: newName });
        expect(result).toEqual(newTaskList);
      });

      it('should throw NotFoundException when renaming a non-existent task list', async () => {
        const taskListId = 1;
        const userId = 2;
        const newName = 'Renamed List';

        jest.spyOn(taskListRepo, 'findOne').mockResolvedValue(null);

        await expect(
          service.renameTaskList(taskListId, userId, newName),
        ).rejects.toThrow(`Task list with ID ${taskListId} not found`);
      });

      it('should throw ForbiddenException when renaming a task list not owned by user', async () => {
        const taskListId = 1;
        const userId = 2;
        const newName = 'Renamed List';

        jest.spyOn(taskListRepo, 'findOne').mockResolvedValue({
          id: taskListId,
          createdBy: { id: 3 },
        } as TaskList);

        await expect(
          service.renameTaskList(taskListId, userId, newName),
        ).rejects.toThrow(
          `Task list with ID ${taskListId} not owned by user ${userId}`,
        );
      });
    });
  });

  describe('task', () => {
    describe('getTasks', () => {
      it('should return all tasks for a given user and task list', async () => {
        const user1Id = 1;
        const user2Id = 2;
        const taskListId = 2;
        const tasks = [
          {
            id: 1,
            name: 'Task 1',
            createdBy: { id: user1Id },
            taskList: { id: taskListId },
          },
          {
            id: 2,
            name: 'Task 2',
            createdBy: { id: user2Id },
            taskList: { id: taskListId },
          },
        ] as Task[];
        const find = jest.spyOn(taskRepo, 'find').mockResolvedValue(tasks);
        const result = await service.getTasks(user1Id, taskListId);
        expect(find).toHaveBeenCalledWith({
          where: { createdBy: { id: user1Id }, taskList: { id: taskListId } },
          relations: ['taskList'],
        });
        expect(result).toEqual(tasks);
      });

      it('should return all tasks for a given user without task list filter', async () => {
        const userId = 1;
        const tasks = [
          { id: 1, name: 'Task 1', taskList: { id: 2 } },
          { id: 2, name: 'Task 2', taskList: { id: 3 } },
        ] as Task[];
        const find = jest.spyOn(taskRepo, 'find').mockResolvedValue(tasks);
        const result = await service.getTasks(userId);
        expect(find).toHaveBeenCalledWith({
          where: { createdBy: { id: userId }, taskList: { id: undefined } },
          relations: ['taskList'],
        });
        expect(result).toEqual(tasks);
      });
    });

    describe('createTask', () => {
      it('should create a task', async () => {
        const taskListId = 1;
        const request = { name: 'New Task', taskListId } as TaskCreateRequest;
        const userId = 3;
        const task = {
          id: 1,
          name: request.name,
          taskList: { id: taskListId },
          createdBy: { id: userId } as User,
        } as Task;

        jest
          .spyOn(taskListRepo, 'findOne')
          .mockResolvedValue({ id: taskListId } as TaskList);
        const create = jest.spyOn(taskRepo, 'create').mockReturnValue(task);
        const save = jest.spyOn(taskRepo, 'save').mockResolvedValue(task);

        const result = await service.createTask(request, userId);

        expect(create).toHaveBeenCalledWith({
          name: request.name,
          taskList: { id: taskListId } as TaskList,
          createdBy: { id: userId } as User,
        });
        expect(save).toHaveBeenCalledWith(task);
        expect(result).toEqual(task);
      });

      it('should throw NotFoundException when creating a task for a non-existent task list', async () => {
        const taskListId = 1;
        const userId = 3;
        const request = { name: 'New Task', taskListId } as TaskCreateRequest;

        jest.spyOn(taskListRepo, 'findOne').mockResolvedValue(null);

        await expect(service.createTask(request, userId)).rejects.toThrow(
          `Task list with ID ${taskListId} not found`,
        );
      });
    });

    describe('deleteTask', () => {
      it('should delete a task', async () => {
        const taskId = 1;
        const userId = 2;
        const deleteResult = { affected: 1, raw: {} };

        const findOne = jest
          .spyOn(taskRepo, 'findOne')
          .mockResolvedValue({ id: taskId, createdBy: { id: userId } } as Task);

        const repoDelete = jest
          .spyOn(taskRepo, 'delete')
          .mockResolvedValue(deleteResult);

        await service.deleteTask(taskId, userId);

        // TODO: 应该修改为使用 mock Repo 测试行为，而不是方法调用
        expect(findOne).toHaveBeenCalledWith({
          where: {
            id: taskId,
          },
          relations: ['createdBy'],
        });
        expect(repoDelete).toHaveBeenCalledWith(taskId);
      });

      it('should throw NotFoundException when deleting a non-existent task', async () => {
        const taskId = 1;
        const userId = 2;
        const deleteResult = { affected: 0, raw: {} };

        jest.spyOn(taskRepo, 'findOne').mockResolvedValue(null);
        jest.spyOn(taskRepo, 'delete').mockResolvedValue(deleteResult);

        await expect(service.deleteTask(taskId, userId)).rejects.toThrow(
          `Task with ID ${taskId} not found`,
        );
      });

      it('should throw ForbiddenException when deleting a task not owned by user', async () => {
        const taskId = 1;
        const userId = 2;

        jest
          .spyOn(taskRepo, 'findOne')
          .mockResolvedValue({ id: taskId, createdBy: { id: 3 } } as Task);

        await expect(service.deleteTask(taskId, userId)).rejects.toThrow(
          `Task with ID ${taskId} not owned by user ${userId}`,
        );
      });
    });

    describe('updateTask', () => {
      it('should update a task', async () => {
        const taskId = 1;
        const userId = 2;
        const updateData = {
          name: 'Updated Task',
          content: 'Updated content',
        } as TaskUpdateRequest;
        const oldTask = {
          id: taskId,
          name: 'Old Task',
          createdBy: { id: userId },
        } as Task;
        const updatedTask = { ...oldTask, ...updateData } as Task;

        jest.spyOn(taskRepo, 'findOne').mockResolvedValue(oldTask);
        const save = jest
          .spyOn(taskRepo, 'save')
          .mockResolvedValue(updatedTask);

        const result = await service.updateTask(taskId, userId, updateData);

        expect(save).toHaveBeenCalledWith({ ...oldTask, ...updateData });
        expect(result).toEqual(updatedTask);
      });

      it('should throw NotFoundException when updating a non-existent task', async () => {
        const taskId = 1;
        const userId = 2;
        const updateData = { name: 'Updated Task' } as TaskUpdateRequest;

        jest.spyOn(taskRepo, 'findOne').mockResolvedValue(null);

        await expect(
          service.updateTask(taskId, userId, updateData),
        ).rejects.toThrow(`Task with ID ${taskId} not found`);
      });

      it('should throw ForbiddenException when updating a task not owned by user', async () => {
        const taskId = 1;
        const userId = 2;
        const updateData = { name: 'Updated Task' } as TaskUpdateRequest;

        jest
          .spyOn(taskRepo, 'findOne')
          .mockResolvedValue({ id: taskId, createdBy: { id: 3 } } as Task);

        await expect(
          service.updateTask(taskId, userId, updateData),
        ).rejects.toThrow(`Task with ID ${taskId} not owned by user ${userId}`);
      });
    });

    describe('move task to another task list', () => {
      it('should move a task to another task list', async () => {
        const taskId = 1;
        const userId = 2;
        const newTaskListId = 3;

        const taskToMove = {
          id: taskId,
          name: 'Old Task',
          taskList: { id: 1 },
          createdBy: { id: userId },
        } as Task;
        const targetTaskList = {
          id: newTaskListId,
          createdBy: { id: userId },
        } as TaskList;

        jest.spyOn(taskRepo, 'findOne').mockResolvedValue(taskToMove);
        jest.spyOn(taskListRepo, 'findOne').mockResolvedValue(targetTaskList);
        const save = jest.spyOn(taskRepo, 'save').mockResolvedValue({
          ...taskToMove,
          taskList: targetTaskList,
        });

        const result = await service.moveToAnotherTaskList(
          taskId,
          newTaskListId,
          userId,
        );

        expect(save).toHaveBeenCalledWith({
          ...taskToMove,
          taskList: targetTaskList,
        });
        expect(result).toEqual(true);
      });

      it('should not move a task if it is already in the target task list', async () => {
        const taskId = 1;
        const userId = 2;
        const newTaskListId = 1; // Same as current task list id

        const taskToMove = {
          id: taskId,
          name: 'Old Task',
          taskList: { id: 1 },
          createdBy: { id: userId },
        } as Task;
        const targetTaskList = {
          id: newTaskListId,
          createdBy: { id: userId },
        } as TaskList;

        jest.spyOn(taskRepo, 'findOne').mockResolvedValue(taskToMove);
        jest.spyOn(taskListRepo, 'findOne').mockResolvedValue(targetTaskList);
        const save = jest.spyOn(taskRepo, 'save').mockResolvedValue({
          ...taskToMove,
          taskList: targetTaskList,
        });

        const result = await service.moveToAnotherTaskList(
          taskId,
          newTaskListId,
          userId,
        );

        expect(save).not.toHaveBeenCalled();
        expect(result).toEqual(false);
      });

      it('should throw NotFoundException when moving a non-existent task', async () => {
        const taskId = 1;
        const userId = 2;
        const newTaskListId = 3;

        jest.spyOn(taskRepo, 'findOne').mockResolvedValue(null);

        await expect(
          service.moveToAnotherTaskList(taskId, newTaskListId, userId),
        ).rejects.toThrow(`Task with ID ${taskId} not found`);
      });

      it('should throw ForbiddenException when moving a task not owned by user', async () => {
        const taskId = 1;
        const userId = 2;
        const newTaskListId = 3;

        jest.spyOn(taskRepo, 'findOne').mockResolvedValue({
          id: taskId,
          taskList: { id: 4 },
          createdBy: { id: 3 },
        } as Task);

        await expect(
          service.moveToAnotherTaskList(taskId, newTaskListId, userId),
        ).rejects.toThrow(`Task with ID ${taskId} not owned by user ${userId}`);
      });

      it('should throw NotFoundException when moving to a non-existent task list', async () => {
        const taskId = 1;
        const userId = 2;
        const newTaskListId = 3;

        jest.spyOn(taskRepo, 'findOne').mockResolvedValue({
          id: taskId,
          taskList: { id: 1 },
          createdBy: { id: userId },
        } as Task);
        jest.spyOn(taskListRepo, 'findOne').mockResolvedValue(null);

        await expect(
          service.moveToAnotherTaskList(taskId, newTaskListId, userId),
        ).rejects.toThrow(`Task list with ID ${newTaskListId} not found`);
      });

      it('should throw ForbiddenException when moving to a task list not owned by user', async () => {
        const taskId = 1;
        const userId = 2;
        const newTaskListId = 3;

        jest.spyOn(taskRepo, 'findOne').mockResolvedValue({
          id: taskId,
          taskList: { id: 1 },
          createdBy: { id: userId },
        } as Task);
        jest.spyOn(taskListRepo, 'findOne').mockResolvedValue({
          id: newTaskListId,
          createdBy: { id: 4 }, // Different user
        } as TaskList);

        await expect(
          service.moveToAnotherTaskList(taskId, newTaskListId, userId),
        ).rejects.toThrow(
          `Task list with ID ${newTaskListId} not owned by user ${userId}`,
        );
      });
    });
  });
});
