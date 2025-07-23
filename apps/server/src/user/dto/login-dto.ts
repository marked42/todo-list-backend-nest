import { IsNotEmpty, MinLength } from 'class-validator';

export class SignInDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  name: string;

  @MinLength(6, {
    message: '密码至少6位字符',
  })
  password: string;
}
