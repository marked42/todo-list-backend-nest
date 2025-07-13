import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../model';

export class TaskUpdateRequest {
  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message: '名称不能为空',
  })
  name?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(TaskStatus, {
    message: `状态必须是 ${Object.values(TaskStatus).join(', ')}`,
  })
  status?: TaskStatus;
}
