import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    const code = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const message = extractExceptionMessage(exceptionResponse); //exceptionResponse

    response.status(code).json({
      code,
      data: null,
      message,
    });
  }
}

function extractExceptionMessage(response: string | object) {
  if (typeof response === 'string') {
    return response;
  }
  // @ts-expect-error message
  return String(response?.message || '');
}
