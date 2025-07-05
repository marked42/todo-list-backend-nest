import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './TaskService';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskList } from '../entity/TaskList';
import { User } from 'src/core/entity/User';

describe('TaskService', () => {
  let service: TaskService;
  let repository: Repository<TaskList>;

  beforeEach(async () => {
    const repoMock = {
      save: jest.fn(),
      delete: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(TaskList),
          useValue: repoMock,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    repository = module.get<Repository<TaskList>>(getRepositoryToken(TaskList));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTaskLists', () => {
    it('should return an all task list if no userId is provided', async () => {
      const allTaskLists = [] as TaskList[];
      const find = jest
        .spyOn(repository, 'find')
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
        .spyOn(repository, 'find')
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

      const save = jest.spyOn(repository, 'save').mockResolvedValue(taskList);

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
        .spyOn(repository, 'delete')
        .mockResolvedValue(deleteResult);

      await service.deleteTaskList(taskListId);

      expect(repoDelete).toHaveBeenCalledWith(taskListId);
    });

    it('should throw NotFoundException when deleting a non-existent task list', async () => {
      const taskListId = 1;
      const deleteResult = { affected: 0, raw: {} };

      jest.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

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
      jest.spyOn(repository, 'findOneBy').mockResolvedValue({ ...oldTaskList });
      const save = jest
        .spyOn(repository, 'save')
        .mockResolvedValue(newTaskList);

      const result = await service.renameTaskList(taskListId, newName);

      expect(save).toHaveBeenCalledWith({ ...oldTaskList, name: newName });
      expect(result).toEqual(newTaskList);
    });

    it('should throw NotFoundException when renaming a non-existent task list', async () => {
      const taskListId = 1;
      const newName = 'Renamed List';

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.renameTaskList(taskListId, newName)).rejects.toThrow(
        `Task list with ID ${taskListId} not found`,
      );
    });
  });
});
