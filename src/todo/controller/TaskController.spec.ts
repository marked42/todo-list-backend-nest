import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TaskController } from './TaskController';
import { TaskService } from '../service/TaskService';
import { Task } from '../entity/Task';
import { TaskMoveResult, TaskPosition } from '../model';
import { AbsoluteMoveRequest } from '../dto/TaskMoveRequest';
import { TaskCreateRequest } from '../dto/TaskCreateRequest';
import { TaskUpdateRequest } from '../dto/TaskUpdateRequest';
import { AbsoluteReorderRequest } from '../dto/TaskReorderRequest';

describe('TaskController', () => {
  let controller: TaskController;
  let taskService: TaskService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: Object.create(TaskService.prototype) as TaskService,
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
      const request = new TaskCreateRequest();
      request.name = 'New Task';
      request.content = '';
      request.taskListId = taskListId;

      const mockTask = {
        id: 1,
        name: request.name,
        content: request.content,
        taskList: { id: taskListId },
      } as Task;

      const createTaskSpy = jest
        .spyOn(taskService, 'createTask')
        .mockResolvedValue(mockTask);

      const result = await controller.createTask(request);
      expect(createTaskSpy).toHaveBeenCalledWith(request);
      expect(result).toEqual(mockTask);
    });

    it('should propagate exception if creation failed', async () => {
      const taskListId = 1;
      const request = new TaskCreateRequest();
      request.name = 'New Task';
      request.content = '';
      request.taskListId = taskListId;

      const createTaskSpy = jest
        .spyOn(taskService, 'createTask')
        .mockRejectedValue(new Error('Creation failed'));

      await expect(controller.createTask(request)).rejects.toThrow(
        'Creation failed',
      );
      expect(createTaskSpy).toHaveBeenCalledWith(request);
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

    it('should propagate exception if failed', async () => {
      const taskId = -1;

      const deleteTaskSpy = jest
        .spyOn(taskService, 'deleteTask')
        .mockRejectedValue(
          new NotFoundException(`Task with ID ${taskId} not found`),
        );

      await expect(controller.deleteTask(taskId)).rejects.toThrow(
        `Task with ID ${taskId} not found`,
      );
      expect(deleteTaskSpy).toHaveBeenCalledWith(taskId);
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const taskId = 1;
      const request = new TaskUpdateRequest();
      request.name = 'Updated Task';

      const updateTaskSpy = jest
        .spyOn(taskService, 'updateTask')
        .mockResolvedValue({
          id: taskId,
          ...request,
        } as Task);

      const result = await controller.updateTask(taskId, request);
      expect(updateTaskSpy).toHaveBeenCalledWith(taskId, request);
      expect(result).toEqual({
        success: true,
        message: `Task with ID ${taskId} updated successfully`,
      });
    });

    it('should propagate exception if update failed', async () => {
      const taskId = -1;
      const request = new TaskUpdateRequest();
      request.name = 'Updated Task';

      const updateTaskSpy = jest
        .spyOn(taskService, 'updateTask')
        .mockRejectedValue(
          new NotFoundException(`Task with ID ${taskId} not found`),
        );

      await expect(controller.updateTask(taskId, request)).rejects.toThrow(
        `Task with ID ${taskId} not found`,
      );
      expect(updateTaskSpy).toHaveBeenCalledWith(taskId, request);
    });
  });

  describe('moveTask', () => {
    it('should move a task to another task list', async () => {
      const taskId = 1;

      const moveTaskSpy = jest
        .spyOn(taskService, 'moveTask')
        .mockResolvedValue(TaskMoveResult.Success);
      const request = new AbsoluteMoveRequest();
      request.taskListId = 3;

      const result = await controller.moveTask(taskId, request);
      expect(moveTaskSpy).toHaveBeenCalledWith(taskId, request);
      expect(result).toEqual({
        success: true,
        message: `Task with ID ${taskId} moved to task list ${request.taskListId} successfully`,
      });
    });

    it('should return successfully if task is already in the target task list', async () => {
      const taskId = 1;
      const request = new AbsoluteMoveRequest();
      // Same as current task list id
      request.taskListId = 1;

      const moveTaskSpy = jest
        .spyOn(taskService, 'moveTask')
        .mockResolvedValue(TaskMoveResult.AlreadyInPlace);

      const result = await controller.moveTask(taskId, request);
      expect(moveTaskSpy).toHaveBeenCalledWith(taskId, request);
      expect(result).toEqual({
        success: true,
        message: `Task with ID ${taskId} is already in task list ${request.taskListId}`,
      });
    });

    it('should propagate exception if failed', async () => {
      const taskId = -1;
      const request = new AbsoluteMoveRequest();
      request.taskListId = 3;

      const moveTaskSpy = jest
        .spyOn(taskService, 'moveTask')
        .mockRejectedValue(
          new NotFoundException(`Task with ID ${taskId} not found`),
        );

      await expect(controller.moveTask(taskId, request)).rejects.toThrow(
        `Task with ID ${taskId} not found`,
      );
      expect(moveTaskSpy).toHaveBeenCalledWith(taskId, request);
    });
  });

  describe('reorderTask', () => {
    it('should reorder a task', async () => {
      const taskId = 1;

      const reorderTaskSpy = jest
        .spyOn(taskService, 'reorderTask')
        .mockResolvedValue(TaskMoveResult.Success);
      const request = new AbsoluteReorderRequest();
      request.position = TaskPosition.First;

      const result = await controller.reorderTask(taskId, request);
      expect(reorderTaskSpy).toHaveBeenCalledWith(taskId, request);
      expect(result).toEqual({
        success: true,
        message: `Task with ID ${taskId} reordered successfully`,
      });
    });

    it('should return successfully if task is already in place', async () => {
      const taskId = 1;
      const request = new AbsoluteReorderRequest();
      request.position = TaskPosition.First;

      const reorderTaskSpy = jest
        .spyOn(taskService, 'reorderTask')
        .mockResolvedValue(TaskMoveResult.AlreadyInPlace);

      const result = await controller.reorderTask(taskId, request);
      expect(reorderTaskSpy).toHaveBeenCalledWith(taskId, request);
      expect(result).toEqual({
        success: true,
        message: `Task with ID ${taskId} is already in place.`,
      });
    });

    it('should propagate exception if failed', async () => {
      const taskId = -1;
      const request = new AbsoluteReorderRequest();
      request.position = TaskPosition.First;

      const reorderTaskSpy = jest
        .spyOn(taskService, 'reorderTask')
        .mockRejectedValue(
          new NotFoundException(`Task with ID ${taskId} not found`),
        );

      await expect(controller.reorderTask(taskId, request)).rejects.toThrow(
        `Task with ID ${taskId} not found`,
      );
      expect(reorderTaskSpy).toHaveBeenCalledWith(taskId, request);
    });
  });
});
