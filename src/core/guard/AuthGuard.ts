import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TOKEN_PREFIX } from '../const/user';
import { JwtService } from '@nestjs/jwt';
import { RequestUser } from '../entity/User';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    // 白名单
    if (['/tokens', '/users'].includes(request.url)) {
      return true;
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('请求没有授权头 Authorization');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        username: string;
      }>(token);

      const requestUser = new RequestUser();
      requestUser.id = payload.sub;
      requestUser.name = payload.username;
      request['user'] = requestUser;

      console.log('payload: ', payload);
    } catch (e: any) {
      console.log('error: ', e);
      throw new UnauthorizedException(`未授权 ${e}`);
    }

    return true;
  }

  private extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === TOKEN_PREFIX ? token : '';
  }
}
