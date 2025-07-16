import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { User } from '@/user/entity/User';
import { TaskService } from '../service/TaskService';
import { TaskListController } from './TaskListController';
import { TaskList } from '../entity/TaskList';
import { CreateTaskListDto } from '../dto/CreateTaskListDto';

describe('TaskListController', () => {
  let controller: TaskListController;
  let taskService: TaskService;

  const mockUser = { id: 1, name: 'Test' } as User;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [TaskListController],
      providers: [
        {
          provide: TaskService,
          useValue: Object.create(TaskService.prototype, {
            user: { value: mockUser },
          }) as TaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskListController>(TaskListController);
    taskService = module.get<TaskService>(TaskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTaskLists', () => {
    it('should return task lists of current user', async () => {
      const mockTaskLists = [new TaskList(), new TaskList()];

      const getTaskLists = jest
        .spyOn(taskService, 'getTaskLists')
        .mockResolvedValue(mockTaskLists);

      const result = await controller.getTaskLists();
      expect(getTaskLists).toHaveBeenCalled();
      expect(result).toEqual(mockTaskLists);
    });
  });

  describe('createTaskList', () => {
    it('should create task list', async () => {
      const dto = { name: 'task-list-1' } as CreateTaskListDto;

      const expectedTaskList = {
        name: dto.name,
        creator: { id: mockUser.id } as User,
      } as TaskList;

      const createTaskList = jest
        .spyOn(taskService, 'createTaskList')
        .mockResolvedValue({
          ...expectedTaskList,
          id: 1,
        });

      const result = await controller.createTaskList(dto);

      // If your controller expects a plain object, not an instance, adjust the expectation accordingly
      expect(createTaskList).toHaveBeenCalledWith(
        expect.objectContaining({
          name: dto.name,
        }),
      );
      expect(result).toEqual({
        ...expectedTaskList,
        id: 1,
        creator: { id: mockUser.id },
      });
    });
  });

  describe('deleteTaskList', () => {
    it('should delete task list', async () => {
      const taskListId = 1;
      const deleteTaskList = jest
        .spyOn(taskService, 'deleteTaskList')
        .mockResolvedValue({ affected: 1, raw: [] });

      const result = await controller.deleteTaskList(taskListId);

      expect(deleteTaskList).toHaveBeenCalledWith(taskListId);
      expect(result).toEqual({
        success: true,
        message: `Task list with ID ${taskListId} deleted successfully`,
      });
    });

    it('should propagate exception when failed', async () => {
      const taskListId = 1;

      const deleteTaskList = jest
        .spyOn(taskService, 'deleteTaskList')
        .mockRejectedValue(
          new NotFoundException(`Task list with ID ${taskListId} not found`),
        );

      await expect(controller.deleteTaskList(1)).rejects.toThrow(
        new NotFoundException(`Task list with ID ${taskListId} not found`),
      );
      expect(deleteTaskList).toHaveBeenCalledWith(taskListId);
    });
  });

  describe('renameTaskList', () => {
    it('should rename task list', async () => {
      const taskListId = 1;
      const newName = 'Renamed Task List';
      const mockTaskList = { id: taskListId, name: newName } as TaskList;

      const renameTaskList = jest
        .spyOn(taskService, 'renameTaskList')
        .mockResolvedValue(mockTaskList);

      const result = await controller.renameTaskList(taskListId, newName);

      expect(renameTaskList).toHaveBeenCalledWith(taskListId, newName);
      expect(result).toEqual({
        success: true,
        message: `Task list with ID ${taskListId} renamed successfully`,
        data: mockTaskList,
      });
    });

    it('throw propagate exception when failed', async () => {
      const taskListId = 1;
      const newName = 'Renamed Task List';

      const renameTaskList = jest
        .spyOn(taskService, 'renameTaskList')
        .mockRejectedValue(
          new NotFoundException(`Task list with ID ${taskListId} not found`),
        );

      await expect(
        controller.renameTaskList(taskListId, newName),
      ).rejects.toThrow(
        new NotFoundException(`Task list with ID ${taskListId} not found`),
      );
      expect(renameTaskList).toHaveBeenCalledWith(taskListId, newName);
    });
  });
});
