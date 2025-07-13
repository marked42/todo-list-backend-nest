import { IsNotEmpty, IsNumber } from 'class-validator';
import { TaskReorderRequest } from './TaskReorderRequest';

export class TaskMoveRequest extends TaskReorderRequest {
  @IsNotEmpty()
  @IsNumber()
  taskListId: number;
}
