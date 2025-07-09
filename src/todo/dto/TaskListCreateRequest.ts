import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class TaskListCreateRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: '名称不能为空',
  })
  @MinLength(2, {
    message: '任务列表名称长度不能少于2个字符',
  })
  @MaxLength(20, {
    message: '任务列表名称不能超过20个字符',
  })
  name: string;
}
