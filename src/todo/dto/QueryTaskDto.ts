import { IsEnum, IsNumber, IsOptional } from 'class-validator';
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
}

export const DEFAULT_TASK_ORDER = TaskOrder.ASC;
