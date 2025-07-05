import { Test } from '@nestjs/testing';
import { TaskController } from './TaskController';
import { TaskService } from '../service/TaskService';
import { Task } from '../entity/Task';
import { User } from 'src/core/entity/User';

describe('TaskController', () => {
  let controller: TaskController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: {
            createTask: jest.fn(),
            deleteTask: jest.fn(),
            renameTask: jest.fn(),
            getTasksByListId: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task', async () => {
      const mockTaskCreateRequest = {
        name: 'New Task',
        content: '',
      };

      const mockRequest = {
        user: {
          id: 2,
        } as User,
      } as unknown as Request & { user: User };

      const taskListId = 1;
      const mockTask = { id: 1, ...mockTaskCreateRequest } as Task;

      const createTaskSpy = jest
        .spyOn(controller, 'createTask')
        .mockResolvedValue(mockTask);

      const result = await controller.createTask(
        taskListId,
        mockTaskCreateRequest,
        mockRequest,
      );
      expect(createTaskSpy).toHaveBeenCalledWith(
        taskListId,
        mockTaskCreateRequest,
        mockRequest,
      );
      expect(result).toEqual(mockTask);
    });
  });
});
