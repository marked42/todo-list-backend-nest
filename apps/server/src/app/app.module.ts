import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter, ResponseInterceptor } from '@/common';
import { TodoModule } from '@/todo';
import { AppConfigModule } from '@/config';
import { DatabaseModule } from '@/database';
import { AuthModule } from '@/auth';
import { UserModule } from '@/user';
import { AppController } from './app.controller';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    TodoModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useValue: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
