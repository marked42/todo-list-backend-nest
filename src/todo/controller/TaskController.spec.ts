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
      const taskListId = 1;
      const mockTaskCreateRequest = {
        name: 'New Task',
        content: '',
        taskListId,
      };

      const mockRequest = {
        user: {
          id: 2,
        } as User,
      } as unknown as Request & { user: User };

      const mockTask = {
        id: 1,
        name: mockTaskCreateRequest.name,
        content: mockTaskCreateRequest.content,
        taskList: { id: taskListId },
      } as Task;

      const createTaskSpy = jest
        .spyOn(controller, 'createTask')
        .mockResolvedValue(mockTask);

      const result = await controller.createTask(
        mockTaskCreateRequest,
        mockRequest,
      );
      expect(createTaskSpy).toHaveBeenCalledWith(
        mockTaskCreateRequest,
        mockRequest,
      );
      expect(result).toEqual(mockTask);
    });
  });
});
