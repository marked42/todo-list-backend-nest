import { IsEnum, IsIn, IsInt, IsNotEmpty } from 'class-validator';
import {
  type AbsolutePosition,
  AbsolutePositions,
  type RelativePosition,
  RelativePositions,
} from '../model';

export class RelativeReorderRequest {
  @IsNotEmpty()
  @IsIn(RelativePositions, {
    message: `Relative position must be one of: ${RelativePositions.join(', ')}`,
  })
  position: RelativePosition;

  @IsInt()
  anchorTaskId: number;
}

export class AbsoluteReorderRequest {
  @IsNotEmpty()
  @IsEnum(AbsolutePositions, {
    message: `Absolute position must be one of: ${AbsolutePositions.join(', ')}`,
  })
  position: AbsolutePosition;
}

export const TaskReorderRequests = [
  RelativeReorderRequest,
  AbsoluteReorderRequest,
];

export type TaskReorderRequest = InstanceType<
  (typeof TaskReorderRequests)[number]
>;
