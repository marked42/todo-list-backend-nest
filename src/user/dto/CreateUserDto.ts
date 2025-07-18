import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @MinLength(6, {
    message: '密码至少6位字符',
  })
  password: string;
}
