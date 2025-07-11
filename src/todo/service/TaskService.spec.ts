import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './TaskService';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@/core/entity/User';
import { TaskList } from '../entity/TaskList';
import { Task } from '../entity/Task';
import { TaskCreateRequest } from '../dto/TaskCreateRequest';
import { TaskUpdateRequest } from '../dto/TaskUpdateRequest';
import { CURRENT_USER } from '@/auth/const';

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
        {
          provide: CURRENT_USER,
          useValue: { id: 1, name: 'User1' },
        },
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

    service = await module.resolve<TaskService>(TaskService);
    taskListRepo = module.get<Repository<TaskList>>(
      getRepositoryToken(TaskList),
    );
    taskRepo = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('test', () => {});
});
