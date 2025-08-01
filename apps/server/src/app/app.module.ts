import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '@/common';
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
  ],
})
export class AppModule {}
