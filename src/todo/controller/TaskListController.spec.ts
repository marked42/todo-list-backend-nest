import { Test } from '@nestjs/testing';
import { TaskService } from '../service/TaskService';
import { TaskListController } from './TaskListController';
import { TaskList } from '../entity/TaskList';
import { User } from 'src/core/entity/User';
import { Request } from 'express';

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

  describe('createTask', () => {
    it('应该成功创建任务列表关联当前用户', async () => {
      const mockRequest = {
        user: {
          id: 2,
        } as User,
      } as unknown as Request & { user: User };

      const mockTaskListCreateRequest = {
        name: '测试任务列表',
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

      const result = await controller.createTask(
        mockTaskListCreateRequest,
        mockRequest,
      );

      expect(createTaskList).toHaveBeenCalledWith(expectedTaskList);
      expect(result).toEqual({
        ...expectedTaskList,
        id: 1,
        createdBy: mockRequest.user,
      });
    });
  });
});
