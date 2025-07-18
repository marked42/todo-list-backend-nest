import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Response, ResponseCode, isStandardResponse } from '../model/response';
import { Observable, map } from 'rxjs';

export class ResponseInterceptor<T = any>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        if (isStandardResponse(data)) {
          return {
            code: data.code ?? ResponseCode.SUCCESS,
            message: data.message ?? 'success',
            data: data.data,
          };
        }

        return {
          code: ResponseCode.SUCCESS,
          data,
          message: 'success',
        };
      }),
    );
  }
}
