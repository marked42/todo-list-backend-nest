import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { User } from '@/core/entity/User';
import { TaskController } from './TaskController';
import { TaskService } from '../service/TaskService';
import { Task } from '../entity/Task';
import { TaskMoveResult } from '../model';
import { TaskMoveRequest } from '../dto/TaskMoveRequest';

describe('TaskController', () => {
  let controller: TaskController;
  let taskService: TaskService;

  const mockUser = { id: 1, name: 'Test' } as User;

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
            updateTask: jest.fn(),
            moveToAnotherTaskList: jest.fn(),
            user: mockUser,
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

      const mockTask = {
        id: 1,
        name: mockTaskCreateRequest.name,
        content: mockTaskCreateRequest.content,
        taskList: { id: taskListId },
      } as Task;

      const createTaskSpy = jest
        .spyOn(taskService, 'createTask')
        .mockResolvedValue(mockTask);

      const result = await controller.createTask(mockTaskCreateRequest);
      expect(createTaskSpy).toHaveBeenCalledWith(mockTaskCreateRequest);
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const taskId = 1;

      const deleteTaskSpy = jest
        .spyOn(taskService, 'deleteTask')
        .mockResolvedValue({ affected: 1, raw: [] });

      const result = await controller.deleteTask(taskId);
      expect(deleteTaskSpy).toHaveBeenCalledWith(taskId);
      expect(result).toEqual({
        success: true,
        message: `Task with ID ${taskId} deleted successfully`,
      });
    });

    it('should throw NotFoundException if task does not exist', async () => {
      const taskId = -1;

      jest
        .spyOn(taskService, 'deleteTask')
        .mockRejectedValue(
          new NotFoundException(`Task with ID ${taskId} not found`),
        );

      await expect(controller.deleteTask(taskId)).rejects.toThrow(
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

      await expect(controller.deleteTask(taskId)).rejects.toThrow(
        `Task with ID ${taskId} not owned by user ${userId}`,
      );
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const taskId = 1;
      const updateData = { name: 'Updated Task' };

      const updateTaskSpy = jest
        .spyOn(taskService, 'updateTask')
        .mockResolvedValue({
          id: taskId,
          ...updateData,
        } as Task);

      const result = await controller.updateTask(taskId, updateData);
      expect(updateTaskSpy).toHaveBeenCalledWith(taskId, updateData);
      expect(result).toEqual({
        success: true,
        message: `Task with ID ${taskId} updated successfully`,
      });
    });

    it('should throw NotFoundException if task does not exist', async () => {
      const taskId = -1;
      const updateData = { name: 'Updated Task' };

      jest
        .spyOn(taskService, 'updateTask')
        .mockRejectedValue(
          new NotFoundException(`Task with ID ${taskId} not found`),
        );

      await expect(controller.updateTask(taskId, updateData)).rejects.toThrow(
        `Task with ID ${taskId} not found`,
      );
    });

    it('should throw ForbiddenException if task does not belong to user', async () => {
      const taskId = 1;
      const userId = 2;
      const updateData = { name: 'Updated Task' };

      jest
        .spyOn(taskService, 'updateTask')
        .mockRejectedValue(
          new ForbiddenException(
            `Task with ID ${taskId} not owned by user ${userId}`,
          ),
        );

      await expect(controller.updateTask(taskId, updateData)).rejects.toThrow(
        `Task with ID ${taskId} not owned by user ${userId}`,
      );
    });
  });

  describe('moveToAnotherTaskList', () => {
    it('should move a task to another task list', async () => {
      const taskId = 1;

      const moveTaskSpy = jest
        .spyOn(taskService, 'moveToAnotherTaskList')
        .mockResolvedValue(TaskMoveResult.Moved);
      const moveRequest = new TaskMoveRequest();
      moveRequest.taskListId = 3;

      const result = await controller.moveToAnotherTaskList(
        taskId,
        moveRequest,
      );
      expect(moveTaskSpy).toHaveBeenCalledWith(taskId, moveRequest);
      expect(result).toEqual({
        success: true,
        message: `Task with ID ${taskId} moved to task list ${moveRequest.taskListId} successfully`,
      });
    });

    it('should return successfully if task is already in the target task list', async () => {
      const taskId = 1;
      const moveRequest = new TaskMoveRequest();
      // Same as current task list id
      moveRequest.taskListId = 1;

      jest
        .spyOn(taskService, 'moveToAnotherTaskList')
        .mockResolvedValue(TaskMoveResult.AlreadyInPlace);

      const result = await controller.moveToAnotherTaskList(
        taskId,
        moveRequest,
      );
      expect(result).toEqual({
        success: true,
        message: `Task with ID ${taskId} is already in task list ${moveRequest.taskListId}`,
      });
    });

    it('should throw NotFoundException if task does not exist', async () => {
      const taskId = -1;
      const moveRequest = new TaskMoveRequest();
      moveRequest.taskListId = 3;

      jest
        .spyOn(taskService, 'moveToAnotherTaskList')
        .mockRejectedValue(
          new NotFoundException(`Task with ID ${taskId} not found`),
        );

      await expect(
        controller.moveToAnotherTaskList(taskId, moveRequest),
      ).rejects.toThrow(`Task with ID ${taskId} not found`);
    });

    it('should throw ForbiddenException if task does not belong to user', async () => {
      const taskId = 1;
      const userId = 2;
      const moveRequest = new TaskMoveRequest();
      moveRequest.taskListId = 3;

      jest
        .spyOn(taskService, 'moveToAnotherTaskList')
        .mockRejectedValue(
          new ForbiddenException(
            `Task with ID ${taskId} not owned by user ${userId}`,
          ),
        );

      await expect(
        controller.moveToAnotherTaskList(taskId, moveRequest),
      ).rejects.toThrow(`Task with ID ${taskId} not owned by user ${userId}`);
    });

    it('should throw NotFoundException if target task list does not exist', async () => {
      const taskId = 1;
      const moveRequest = new TaskMoveRequest();
      moveRequest.taskListId = -1;

      jest
        .spyOn(taskService, 'moveToAnotherTaskList')
        .mockRejectedValue(
          new NotFoundException(
            `Task list with ID ${moveRequest.taskListId} not found`,
          ),
        );

      await expect(
        controller.moveToAnotherTaskList(taskId, moveRequest),
      ).rejects.toThrow(
        `Task list with ID ${moveRequest.taskListId} not found`,
      );
    });

    it('should throw ForbiddenException if user does not have permission to move task', async () => {
      const taskId = 1;
      const userId = 2;
      const moveRequest = new TaskMoveRequest();
      moveRequest.taskListId = 3;

      jest
        .spyOn(taskService, 'moveToAnotherTaskList')
        .mockRejectedValue(
          new ForbiddenException(
            `User ${userId} does not have permission to move task with ID ${taskId}`,
          ),
        );

      await expect(
        controller.moveToAnotherTaskList(taskId, moveRequest),
      ).rejects.toThrow(
        `User ${userId} does not have permission to move task with ID ${taskId}`,
      );
    });
  });
});
