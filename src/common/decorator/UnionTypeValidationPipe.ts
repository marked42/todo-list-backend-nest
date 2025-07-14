import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { ClassConstructor, plainToInstance } from 'class-transformer';

@Injectable()
export class UnionTypeValidationPipe implements PipeTransform {
  constructor(private readonly types: ClassConstructor<any>[]) {
    if (types.length === 0) {
      throw new Error('At least one type must be provided');
    }
  }

  async transform<T>(value: T) {
    let validInstance: object | null = null;

    for (const Type of this.types) {
      // 使用 class-transformer 的 plainToInstance 替代 Object.assign
      const instance = plainToInstance(Type, value, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }) as object;

      const errors = await validate(instance);
      if (errors.length === 0) {
        validInstance = instance;
        break;
      }
    }

    if (!validInstance) {
      const classNames = this.types
        .map((t) => t.name)
        .filter(Boolean)
        .join(', ');
      throw new BadRequestException(`Must be one of ${classNames}`);
    }

    return value;
  }
}
