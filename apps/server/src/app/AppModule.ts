import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '@/common/filter/HttpExceptionFilter';
import { TodoModule } from '@/todo/TodoModule';
import { AppConfigModule } from '@/config/AppConfigModule';
import { DatabaseModule } from '@/database/DatabaseModule';
import { HealthController } from './controller/HealthController';
import { AuthModule } from '@/auth/AuthModule';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    TodoModule,
    AuthModule,
    UserModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
