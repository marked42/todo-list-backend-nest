import { IsArray, IsEnum, IsInt, IsNumber, IsOptional } from 'class-validator';
import { TaskOrder } from '../model';

export class QueryTaskDto {
  @IsNumber()
  @IsOptional()
  taskListId?: number;

  @IsOptional()
  @IsEnum(TaskOrder, {
    message: `Task order must be one of: ${Object.values(TaskOrder).join(', ')}`,
  })
  order = DEFAULT_TASK_ORDER;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  users?: number[];
}

export const DEFAULT_TASK_ORDER = TaskOrder.ASC;
