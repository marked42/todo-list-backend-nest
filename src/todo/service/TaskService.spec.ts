import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './TaskService';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskList } from '../entity/TaskList';
import { User } from 'src/core/entity/User';
import { Task } from '../entity/Task';
import { TaskCreateRequest } from '../dto/TaskCreateRequest';

describe('TaskService', () => {
  let service: TaskService;
  let taskListRepo: Repository<TaskList>;
  let taskRepo: Repository<Task>;

  beforeEach(async () => {
    // TODO: need a mock util
    const taskListRepoMock = {
      save: jest.fn(),
      delete: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
    };

    const taskRepoMock = {
      save: jest.fn(),
      delete: jest.fn(),
      findOneBy: jest.fn(),
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

  describe('getTaskLists', () => {
    it('should return an all task list if no userId is provided', async () => {
      const allTaskLists = [] as TaskList[];
      const find = jest
        .spyOn(taskListRepo, 'find')
        .mockResolvedValue(allTaskLists);

      const result = await service.getTaskLists();
      expect(find).toHaveBeenCalledWith({
        where: { createdBy: { userId: undefined } },
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

      const save = jest.spyOn(taskListRepo, 'save').mockResolvedValue(taskList);

      const result = await service.createTaskList(taskList);

      expect(save).toHaveBeenCalledWith(taskList);
      expect(result).toEqual(taskList);
    });
  });

  describe('deleteTaskList', () => {
    it('should delete a task list', async () => {
      const taskListId = 1;
      const deleteResult = { affected: 1, raw: {} };

      const repoDelete = jest
        .spyOn(taskListRepo, 'delete')
        .mockResolvedValue(deleteResult);

      await service.deleteTaskList(taskListId);

      expect(repoDelete).toHaveBeenCalledWith(taskListId);
    });

    it('should throw NotFoundException when deleting a non-existent task list', async () => {
      const taskListId = 1;
      const deleteResult = { affected: 0, raw: {} };

      jest.spyOn(taskListRepo, 'delete').mockResolvedValue(deleteResult);

      await expect(service.deleteTaskList(taskListId)).rejects.toThrow(
        `Task list with ID ${taskListId} not found`,
      );
    });
  });

  describe('renameTaskList', () => {
    it('should rename a task list', async () => {
      const taskListId = 1;
      const oldName = 'Old List';
      const newName = 'New List';
      const oldTaskList = { id: taskListId, name: oldName } as TaskList;
      const newTaskList = { id: taskListId, name: newName } as TaskList;

      // 注意这里mock返回值应该是拷贝副本，否则在 save方法中oldTaskList.name 会被修改
      jest
        .spyOn(taskListRepo, 'findOneBy')
        .mockResolvedValue({ ...oldTaskList });
      const save = jest
        .spyOn(taskListRepo, 'save')
        .mockResolvedValue(newTaskList);

      const result = await service.renameTaskList(taskListId, newName);

      expect(save).toHaveBeenCalledWith({ ...oldTaskList, name: newName });
      expect(result).toEqual(newTaskList);
    });

    it('should throw NotFoundException when renaming a non-existent task list', async () => {
      const taskListId = 1;
      const newName = 'Renamed List';

      jest.spyOn(taskListRepo, 'findOneBy').mockResolvedValue(null);

      await expect(service.renameTaskList(taskListId, newName)).rejects.toThrow(
        `Task list with ID ${taskListId} not found`,
      );
    });
  });

  describe('createTask', () => {
    it('should create a task', async () => {
      const taskListId = 1;
      const request = { name: 'New Task' } as TaskCreateRequest;
      const userId = 3;
      const task = {
        id: 1,
        name: request.name,
        taskList: { id: taskListId },
        createdBy: { id: userId } as User,
      } as Task;

      jest
        .spyOn(taskListRepo, 'findOneBy')
        .mockResolvedValue({ id: taskListId } as TaskList);
      const create = jest.spyOn(taskRepo, 'create').mockReturnValue(task);
      const save = jest.spyOn(taskRepo, 'save').mockResolvedValue(task);

      const result = await service.createTask(taskListId, request, userId);

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
      const request = { name: 'New Task' } as TaskCreateRequest;

      jest.spyOn(taskListRepo, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.createTask(taskListId, request, userId),
      ).rejects.toThrow(
        `Task list with ID ${taskListId} not found, cannot create task`,
      );
    });
  });
});
