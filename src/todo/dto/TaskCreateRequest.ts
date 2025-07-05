import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class TaskCreateRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: '名称不能为空',
  })
  @MaxLength(20, {
    message: '任务名称不能超过20个字符',
  })
  name: string;
}
