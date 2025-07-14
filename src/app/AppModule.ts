import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from '@/common/filter/HttpExceptionFilter';
import { TodoModule } from '@/todo/TodoModule';
import { AppConfigModule } from '@/config/AppConfigModule';
import { DatabaseModule } from '@/database/DatabaseModule';
import { HealthController } from './controller/HealthController';
import { AuthModule } from '@/auth/AuthModule';
import { AuthGuard } from '@/auth/guard/AuthGuard';
import { UserModule } from '@/user/UserModule';

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
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
