import { Test } from '@nestjs/testing';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { ResponseInterceptor } from './ResponseInterceptor';
import { ResponseCode, resp } from '../model';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeAll(async () => {
    // 创建测试模块
    const moduleRef = await Test.createTestingModule({
      providers: [ResponseInterceptor],
    }).compile();

    interceptor = moduleRef.get<ResponseInterceptor>(ResponseInterceptor);

    // 模拟 ExecutionContext
    mockExecutionContext = {
      switchToHttp: {
        getResponse: jest.fn(),
        getRequest: jest.fn(),
      },
    } as unknown as ExecutionContext;

    // 模拟 CallHandler
    mockCallHandler = {
      handle: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('should transform primitive values correctly', () => {
    const testCases = [
      ['string', 'test value'],
      ['number', 42],
      ['boolean', true],
      ['null', null],
      ['undefined', undefined],
    ] as const;

    test.each(testCases)('should transform %s', async (_type, input) => {
      jest.spyOn(mockCallHandler, 'handle').mockReturnValue(of(input));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );
      const result = await lastValueFrom(result$);

      expect(result).toEqual({
        code: 0,
        data: input,
        message: 'success',
      });
    });
  });

  describe('should transform non-primitive value correctly', () => {
    const testCases = [
      ['object', { id: 1, name: 'John' }],
      ['empty object', {}],
      ['nested object', { user: { id: 1, roles: ['admin'] } }],
      ['array', [1, 2, 3]],
      ['empty', []],
    ] as const;

    test.each(testCases)('should transform %s', async (_type, input) => {
      jest.spyOn(mockCallHandler, 'handle').mockReturnValue(of(input));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );
      const result = await lastValueFrom(result$);

      expect(result).toEqual({
        code: 0,
        data: input,
        message: 'success',
      });
    });
  });

  describe('should keep standard response', () => {
    const testCases = [
      ['complete', resp({ data: 1 })],
      [
        'partial',
        resp({ code: ResponseCode.SUCCESS, data: 1, message: 'test' }),
      ],
      ['empty', resp({})],
    ] as const;

    test.each(testCases)('should transform %s', async (_type, input) => {
      jest.spyOn(mockCallHandler, 'handle').mockReturnValue(of(input));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );
      const result = await lastValueFrom(result$);

      expect(result).toEqual(expect.objectContaining({ ...input }));
    });
  });
});
