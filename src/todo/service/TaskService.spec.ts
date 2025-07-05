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
});
