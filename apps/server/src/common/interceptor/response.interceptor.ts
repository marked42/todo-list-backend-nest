import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Response, isStandardResponse, resp } from '../model/response';
import { Observable, map } from 'rxjs';

export class ResponseInterceptor<T = unknown>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data): Response<T> => {
        if (isStandardResponse(data)) {
          return data as Response<T>;
        }

        return resp<T>({ data });
      }),
    );
  }
}
