import { BadRequestException } from '@nestjs/common';
import * as validators from 'class-validator';
import { UnionTypeValidationPipe } from './union-type-validation-pipe.decorator';

describe('UnionTypeValidationPipe', () => {
  let pipe: UnionTypeValidationPipe;

  class TestTypeA {
    name: string;
    age: number;
  }

  class TestTypeB {
    id: string;
    active: boolean;
  }

  class TestTypeC {
    email: string;
    verified: boolean;
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when validating a value against multiple types', () => {
    it('should pass if value matches at least one type', async () => {
      jest
        .spyOn(validators, 'validate')
        // First type fails
        .mockResolvedValueOnce([
          {
            constraints: { isString: 'name must be a string' },
            property: 'name',
          },
        ])
        // Second type passes
        .mockResolvedValueOnce([]);

      pipe = new UnionTypeValidationPipe([TestTypeA, TestTypeB]);
      const testValue = { id: '123', active: true };

      const result = await pipe.transform(testValue);
      expect(result).toEqual(testValue);
    });

    it('should throw BadRequestException if value matches none of the types', async () => {
      jest
        .spyOn(validators, 'validate')
        .mockResolvedValueOnce([
          {
            constraints: { isString: 'name must be a string' },
            property: 'name',
          },
        ])
        .mockResolvedValueOnce([
          { constraints: { isString: 'id must be a string' }, property: 'id' },
        ]);

      pipe = new UnionTypeValidationPipe([TestTypeA, TestTypeB]);
      const testValue = { invalid: 'data' };

      await expect(pipe.transform(testValue)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should include the types in the error message when validation fails', async () => {
      jest.spyOn(validators, 'validate').mockResolvedValue([
        {
          constraints: { isString: 'name must be a string' },
          property: 'name',
        },
      ]);

      pipe = new UnionTypeValidationPipe([TestTypeA, TestTypeB, TestTypeC]);
      const testValue = { invalid: 'data' };

      await expect(pipe.transform(testValue)).rejects.toThrow(
        new BadRequestException(
          'Must be one of TestTypeA, TestTypeB, TestTypeC',
        ),
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty types array', () => {
      try {
        new UnionTypeValidationPipe([]);
      } catch (e) {
        expect(e).toEqual(new Error(`At least one type must be provided`));
      }
    });
    it('should handle null value', async () => {
      jest.spyOn(validators, 'validate').mockResolvedValue([
        {
          constraints: { isString: 'name must be a string' },
          property: 'name',
        },
      ]);
      pipe = new UnionTypeValidationPipe([TestTypeA]);
      await expect(pipe.transform(null)).rejects.toThrow(BadRequestException);
    });

    it('should handle undefined value', async () => {
      jest.spyOn(validators, 'validate').mockResolvedValue([
        {
          constraints: { isString: 'name must be a string' },
          property: 'name',
        },
      ]);
      pipe = new UnionTypeValidationPipe([TestTypeA]);
      await expect(pipe.transform(undefined)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
