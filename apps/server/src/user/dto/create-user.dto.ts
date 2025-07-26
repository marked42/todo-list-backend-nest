import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: '用户邮箱能为空' })
  email: string;

  @MinLength(6, {
    message: '密码至少6位字符',
  })
  password: string;
}
