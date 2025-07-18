import { IsNotEmpty, IsNumber } from 'class-validator';
import {
  AbsoluteReorderTaskDto,
  RelativeReorderTaskDto,
} from './ReorderTaskDto';

export class RelativeMoveTaskDto extends RelativeReorderTaskDto {
  @IsNotEmpty()
  @IsNumber()
  taskListId: number;
}

export class AbsoluteMoveTaskDto extends AbsoluteReorderTaskDto {
  @IsNotEmpty()
  @IsNumber()
  taskListId: number;
}

export const MoveTaskDtoClasses = [RelativeMoveTaskDto, AbsoluteMoveTaskDto];

export type MoveTaskDto = InstanceType<(typeof MoveTaskDtoClasses)[number]>;
