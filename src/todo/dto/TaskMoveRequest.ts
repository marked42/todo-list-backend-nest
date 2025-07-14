import { IsNotEmpty, IsNumber } from 'class-validator';
import {
  AbsoluteReorderRequest,
  RelativeReorderRequest,
} from './TaskReorderRequest';

export class RelativeMoveRequest extends RelativeReorderRequest {
  @IsNotEmpty()
  @IsNumber()
  taskListId: number;
}

export class AbsoluteMoveRequest extends AbsoluteReorderRequest {
  @IsNotEmpty()
  @IsNumber()
  taskListId: number;
}

export const TaskMoveRequests = [RelativeMoveRequest, AbsoluteMoveRequest];

export type TaskMoveRequest = InstanceType<(typeof TaskMoveRequests)[number]>;
