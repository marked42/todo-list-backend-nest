import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate, ValidatorOptions } from 'class-validator';
import { ClassConstructor, plainToInstance } from 'class-transformer';

@Injectable()
export class UnionTypeValidationPipe implements PipeTransform {
  constructor(
    private readonly types: ClassConstructor<any>[],
    private readonly validatorOptions?: ValidatorOptions,
  ) {
    if (types.length === 0) {
      throw new Error('At least one type must be provided');
    }
  }

  async transform(value: any) {
    let validInstance = null;

    for (const Type of this.types) {
      // 使用 class-transformer 的 plainToInstance 替代 Object.assign
      const instance = plainToInstance(Type, value, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      });

      const errors = await validate(instance, this.validatorOptions);
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
