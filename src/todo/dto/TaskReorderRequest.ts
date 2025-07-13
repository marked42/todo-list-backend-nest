import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export enum TaskPosition {
  Before = 'before',
  After = 'after',
  First = 'first',
  Last = 'last',
}

// TODO: validate union type of relative and absolute position
export class TaskReorderRequest {
  @IsNotEmpty()
  @IsEnum(TaskPosition, {
    message: `Position must be one of: ${Object.values(TaskPosition).join(', ')}`,
  })
  position: TaskPosition;

  @ValidateIf((o: TaskReorderRequest) =>
    [TaskPosition.Before, o.position === TaskPosition.After].includes(
      o.position,
    ),
  )
  @IsString()
  anchorTaskId?: number;
}
