import { Test } from '@nestjs/testing';
import { TaskService } from '../service/TaskService';
import { TaskListController } from './TaskListController';
import { TaskList } from '../entity/TaskList';
import { User } from '@/core/entity/User';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('TaskListController', () => {
  let controller: TaskListController;
  let taskService: TaskService;

  const mockUser = { id: 1, name: 'Test' } as User;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [TaskListController],
      providers: [
        {
          // TODO: best way to mock TaskService
          provide: TaskService,
          useValue: {
            createTaskList: jest.fn(),
            deleteTaskList: jest.fn(),
            renameTaskList: jest.fn(),
            getTaskLists: jest.fn(),
            user: mockUser,
          },
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
      const taskCreateRequestMock = {
        name: 'task-list-1',
      };

      const expectedTaskList = new TaskList();
      expectedTaskList.name = taskCreateRequestMock.name;
      expectedTaskList.createdBy = { id: mockUser.id } as User;

      const createTaskList = jest
        .spyOn(taskService, 'createTaskList')
        .mockResolvedValue({
          ...expectedTaskList,
          id: 1,
        });

      const result = await controller.createTaskList(taskCreateRequestMock);

      // If your controller expects a plain object, not an instance, adjust the expectation accordingly
      expect(createTaskList).toHaveBeenCalledWith(
        expect.objectContaining({
          name: taskCreateRequestMock.name,
        }),
      );
      expect(result).toEqual({
        ...expectedTaskList,
        id: 1,
        createdBy: { id: mockUser.id },
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

    it('should throw error 404 when deleting non-exist task list', async () => {
      const taskListId = 1;

      jest
        .spyOn(taskService, 'deleteTaskList')
        .mockRejectedValue(
          new NotFoundException(`Task list with ID ${taskListId} not found`),
        );

      await expect(controller.deleteTaskList(1)).rejects.toThrow(
        new NotFoundException(`Task list with ID ${taskListId} not found`),
      );
    });

    it('should throw error 403 when deleting task list not owned by user', async () => {
      const taskListId = 1;
      jest
        .spyOn(taskService, 'deleteTaskList')
        .mockRejectedValue(
          new ForbiddenException(
            `Task list with ID ${taskListId} not owned by user ${mockUser.id}`,
          ),
        );

      await expect(controller.deleteTaskList(taskListId)).rejects.toThrow(
        new ForbiddenException(
          `Task list with ID ${taskListId} not owned by user ${mockUser.id}`,
        ),
      );
    });
  });

  describe('renameTaskList', () => {
    it('should rename task list', async () => {
      const taskListId = 1;
      const newName = 'Renamed Task List';
      const mockTaskList = new TaskList();
      mockTaskList.id = taskListId;
      mockTaskList.name = newName;

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

    it('throw error 404 when renaming non-exist task list', async () => {
      const taskListId = 1;
      jest
        .spyOn(taskService, 'renameTaskList')
        .mockRejectedValue(
          new NotFoundException(`Task list with ID ${taskListId} not found`),
        );

      await expect(controller.renameTaskList(1, 'New Name')).rejects.toThrow(
        new NotFoundException(`Task list with ID ${taskListId} not found`),
      );
    });
  });
});
