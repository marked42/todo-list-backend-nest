import { Test } from '@nestjs/testing';
import { TaskController } from './TaskController';
import { TaskService } from '../service/TaskService';
import { Task } from '../entity/Task';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('TaskController', () => {
  let controller: TaskController;
  let taskService: TaskService;

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
    taskService = module.get<TaskService>(TaskService);
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

      const userId = 2;

      const mockTask = {
        id: 1,
        name: mockTaskCreateRequest.name,
        content: mockTaskCreateRequest.content,
        taskList: { id: taskListId },
      } as Task;

      const createTaskSpy = jest
        .spyOn(taskService, 'createTask')
        .mockResolvedValue(mockTask);

      const result = await controller.createTask(mockTaskCreateRequest, userId);
      expect(createTaskSpy).toHaveBeenCalledWith(mockTaskCreateRequest, userId);
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const taskId = 1;
      const userId = 2;

      const deleteTaskSpy = jest
        .spyOn(taskService, 'deleteTask')
        .mockResolvedValue();

      const result = await controller.deleteTask(taskId, userId);
      expect(deleteTaskSpy).toHaveBeenCalledWith(taskId, userId);
      expect(result).toEqual({
        success: true,
        message: `Task with ID ${taskId} deleted successfully`,
      });
    });

    it('should throw NotFoundException if task does not exist', async () => {
      const taskId = -1;
      const userId = 2;

      jest
        .spyOn(taskService, 'deleteTask')
        .mockRejectedValue(
          new NotFoundException(`Task with ID ${taskId} not found`),
        );

      await expect(controller.deleteTask(taskId, userId)).rejects.toThrow(
        `Task with ID ${taskId} not found`,
      );
    });

    it('should throw ForbiddenException if task does not belong to user', async () => {
      const taskId = 1;
      const userId = 2;

      jest
        .spyOn(taskService, 'deleteTask')
        .mockRejectedValue(
          new ForbiddenException(
            `Task with ID ${taskId} not owned by user ${userId}`,
          ),
        );

      await expect(controller.deleteTask(taskId, userId)).rejects.toThrow(
        `Task with ID ${taskId} not owned by user ${userId}`,
      );
    });
  });
});
