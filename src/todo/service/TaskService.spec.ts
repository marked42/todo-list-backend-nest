import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './TaskService';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskList } from '../entity/TaskList';

describe('TaskService', () => {
  let service: TaskService;
  let repository: Repository<TaskList>;

  beforeEach(async () => {
    const repoMock = {
      save: jest.fn(),
      delete: jest.fn(),
      findOneBy: jest.fn(),
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

  it('should create a task list', async () => {
    const taskList = { id: 1, name: 'Test List' } as TaskList;

    const save = jest.spyOn(repository, 'save').mockResolvedValue(taskList);

    const result = await service.createTaskList(taskList);

    expect(save).toHaveBeenCalledWith(taskList);
    expect(result).toEqual(taskList);
  });

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
