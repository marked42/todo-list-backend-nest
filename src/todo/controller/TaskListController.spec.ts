import { Test } from '@nestjs/testing';
import { TaskService } from '../service/TaskService';
import { TaskListController } from './TaskListController';
import { TaskList } from '../entity/TaskList';
import { User } from 'src/core/entity/User';
import { Request } from 'express';
import { NotFoundException } from '@nestjs/common';

describe('TaskListController', () => {
  let controller: TaskListController;
  let taskService: TaskService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [TaskListController],
      providers: [
        {
          provide: TaskService,
          useValue: {
            createTaskList: jest.fn(),
            deleteTaskList: jest.fn(),
            renameTaskList: jest.fn(),
            getTaskLists: jest.fn(),
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
    it('should return task lists for a given userId', async () => {
      const mockUserId = 1;
      const mockTaskLists = [new TaskList(), new TaskList()];

      const getTaskLists = jest
        .spyOn(taskService, 'getTaskLists')
        .mockResolvedValue(mockTaskLists);

      const result = await controller.getTaskLists(mockUserId);
      expect(getTaskLists).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockTaskLists);
    });
  });

  describe('createTaskList', () => {
    it('should create task list', async () => {
      const mockRequest = {
        user: {
          id: 2,
        } as User,
      } as unknown as Request & { user: User };

      const mockTaskListCreateRequest = {
        name: 'task-list-1',
      };

      const expectedTaskList = new TaskList();
      expectedTaskList.name = mockTaskListCreateRequest.name;
      expectedTaskList.createdBy = mockRequest.user;

      const createTaskList = jest
        .spyOn(taskService, 'createTaskList')
        .mockResolvedValue({
          ...expectedTaskList,
          id: 1,
          createdBy: mockRequest.user,
        });

      const result = await controller.createTaskList(
        mockTaskListCreateRequest,
        mockRequest,
      );

      // If your controller expects a plain object, not an instance, adjust the expectation accordingly
      expect(createTaskList).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockTaskListCreateRequest.name,
          createdBy: mockRequest.user,
        }),
      );
      expect(result).toEqual({
        ...expectedTaskList,
        id: 1,
        createdBy: mockRequest.user,
      });
    });
  });

  describe('deleteTaskList', () => {
    it('should delete task list', async () => {
      const taskListId = 1;
      const deleteTaskList = jest
        .spyOn(taskService, 'deleteTaskList')
        .mockResolvedValue();

      const result = await controller.deleteTaskList(taskListId);

      expect(deleteTaskList).toHaveBeenCalledWith(taskListId);
      expect(result).toEqual({
        success: true,
        message: `Task list with ID ${taskListId} deleted successfully`,
      });
    });

    it('throw error 404 when deleting non-exist task list', async () => {
      jest
        .spyOn(taskService, 'deleteTaskList')
        .mockRejectedValue(
          new NotFoundException('Task list with ID ${taskListId} not found'),
        );

      await expect(controller.deleteTaskList(1)).rejects.toThrow(
        new NotFoundException('Task list with ID ${taskListId} not found'),
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
