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
});
