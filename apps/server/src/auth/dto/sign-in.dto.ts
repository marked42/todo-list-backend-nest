import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @IsEmail({}, { message: '用户邮箱不合法' })
  @IsNotEmpty({
    message: '用户邮箱不能为空',
  })
  @ApiProperty()
  email: string;

  @IsString({
    message: '密码不能为空',
  })
  @MinLength(6, {
    message: '密码至少6个字符',
  })
  password: string;
}
