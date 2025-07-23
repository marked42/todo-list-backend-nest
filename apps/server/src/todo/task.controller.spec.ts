import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { Task } from './entity/task.entity';
import { TaskMoveResult, TaskPosition } from './model';
import { AbsoluteMoveTaskDto } from './dto/move-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AbsoluteReorderTaskDto } from './dto/reorder-task.dto';

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
      const dto = {
        name: 'New Task',
        content: '',
        taskListId,
      } as CreateTaskDto;

      const mockTask = {
        id: 1,
        name: dto.name,
        content: dto.content,
        taskList: { id: taskListId },
      } as Task;

      const createTaskSpy = jest
        .spyOn(taskService, 'createTask')
        .mockResolvedValue(mockTask);

      const result = await controller.createTask(dto);
      expect(createTaskSpy).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTask);
    });

    it('should propagate exception if creation failed', async () => {
      const taskListId = 1;
      const dto = {
        name: 'New Task',
        content: '',
        taskListId,
      } as CreateTaskDto;

      const createTaskSpy = jest
        .spyOn(taskService, 'createTask')
        .mockRejectedValue(new Error('Creation failed'));

      await expect(controller.createTask(dto)).rejects.toThrow(
        'Creation failed',
      );
      expect(createTaskSpy).toHaveBeenCalledWith(dto);
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
      const dto = { name: 'Updated Task' } as UpdateTaskDto;

      const updateTaskSpy = jest
        .spyOn(taskService, 'updateTask')
        .mockResolvedValue({
          id: taskId,
          ...dto,
        } as Task);

      const result = await controller.updateTask(taskId, dto);
      expect(updateTaskSpy).toHaveBeenCalledWith(taskId, dto);
      expect(result).toEqual({
        success: true,
        message: `Task with ID ${taskId} updated successfully`,
      });
    });

    it('should propagate exception if update failed', async () => {
      const taskId = -1;
      const dto = { name: 'Updated Task' } as UpdateTaskDto;

      const updateTaskSpy = jest
        .spyOn(taskService, 'updateTask')
        .mockRejectedValue(
          new NotFoundException(`Task with ID ${taskId} not found`),
        );

      await expect(controller.updateTask(taskId, dto)).rejects.toThrow(
        `Task with ID ${taskId} not found`,
      );
      expect(updateTaskSpy).toHaveBeenCalledWith(taskId, dto);
    });
  });

  describe('moveTask', () => {
    it('should move a task to another task list', async () => {
      const taskId = 1;

      const moveTaskSpy = jest
        .spyOn(taskService, 'moveTask')
        .mockResolvedValue(TaskMoveResult.Success);
      const dto = { taskListId: 3 } as AbsoluteMoveTaskDto;

      const result = await controller.moveTask(taskId, dto);
      expect(moveTaskSpy).toHaveBeenCalledWith(taskId, dto);
      expect(result).toEqual({
        success: true,
        message: `Task with ID ${taskId} moved to task list ${dto.taskListId} successfully`,
      });
    });

    it('should return successfully if task is already in the target task list', async () => {
      const taskId = 1;
      // Same as current task list id
      const dto = { taskListId: 1 } as AbsoluteMoveTaskDto;

      const moveTaskSpy = jest
        .spyOn(taskService, 'moveTask')
        .mockResolvedValue(TaskMoveResult.AlreadyInPlace);

      const result = await controller.moveTask(taskId, dto);
      expect(moveTaskSpy).toHaveBeenCalledWith(taskId, dto);
      expect(result).toEqual({
        success: true,
        message: `Task with ID ${taskId} is already in task list ${dto.taskListId}`,
      });
    });

    it('should propagate exception if failed', async () => {
      const taskId = -1;
      const dto = { taskListId: 3 } as AbsoluteMoveTaskDto;

      const moveTaskSpy = jest
        .spyOn(taskService, 'moveTask')
        .mockRejectedValue(
          new NotFoundException(`Task with ID ${taskId} not found`),
        );

      await expect(controller.moveTask(taskId, dto)).rejects.toThrow(
        `Task with ID ${taskId} not found`,
      );
      expect(moveTaskSpy).toHaveBeenCalledWith(taskId, dto);
    });
  });

  describe('reorderTask', () => {
    it('should reorder a task', async () => {
      const taskId = 1;

      const reorderTaskSpy = jest
        .spyOn(taskService, 'reorderTask')
        .mockResolvedValue(TaskMoveResult.Success);
      const dto = { position: TaskPosition.First } as AbsoluteReorderTaskDto;

      const result = await controller.reorderTask(taskId, dto);
      expect(reorderTaskSpy).toHaveBeenCalledWith(taskId, dto);
      expect(result).toEqual({
        success: true,
        message: `Task with ID ${taskId} reordered successfully`,
      });
    });

    it('should return successfully if task is already in place', async () => {
      const taskId = 1;
      const dto = { position: TaskPosition.First } as AbsoluteReorderTaskDto;

      const reorderTaskSpy = jest
        .spyOn(taskService, 'reorderTask')
        .mockResolvedValue(TaskMoveResult.AlreadyInPlace);

      const result = await controller.reorderTask(taskId, dto);
      expect(reorderTaskSpy).toHaveBeenCalledWith(taskId, dto);
      expect(result).toEqual({
        success: true,
        message: `Task with ID ${taskId} is already in place.`,
      });
    });

    it('should propagate exception if failed', async () => {
      const taskId = -1;
      const dto = { position: TaskPosition.First } as AbsoluteReorderTaskDto;

      const reorderTaskSpy = jest
        .spyOn(taskService, 'reorderTask')
        .mockRejectedValue(
          new NotFoundException(`Task with ID ${taskId} not found`),
        );

      await expect(controller.reorderTask(taskId, dto)).rejects.toThrow(
        `Task with ID ${taskId} not found`,
      );
      expect(reorderTaskSpy).toHaveBeenCalledWith(taskId, dto);
    });
  });
});
