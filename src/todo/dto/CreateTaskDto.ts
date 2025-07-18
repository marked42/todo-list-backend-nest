import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: '名称不能为空',
  })
  @MaxLength(20, {
    message: '任务名称不能超过20个字符',
  })
  name: string;

  @ApiProperty()
  @IsString()
  @MaxLength(2000, {
    message: '任务名称不能超过2000个字符',
  })
  content: string;

  @IsNotEmpty({
    message: '任务列表ID不能为空',
  })
  taskListId: number;
}
