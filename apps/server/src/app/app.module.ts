import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '@/common/filter/http-exception.filter';
import { TodoModule } from '@/todo/todo.module';
import { AppConfigModule } from '@/config/app-config.module';
import { DatabaseModule } from '@/database/database.module';
import { AppController } from './app.controller';
import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';

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
