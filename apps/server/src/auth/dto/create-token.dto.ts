import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateTokenDto {
  @IsNotEmpty({
    message: '用户名不能为空',
  })
  @ApiProperty()
  name: string;

  @IsString({
    message: '密码不能为空',
  })
  @MinLength(6, {
    message: '密码至少6个字符',
  })
  password: string;
}
