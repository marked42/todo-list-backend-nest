import { Module } from '@nestjs/common';
import { CoreModule } from '@/core/CoreModule';
import { TodoModule } from '@/todo/TodoModule';
import { AppConfigModule } from '@/config/AppConfigModule';
import { DatabaseModule } from '@/database/DatabaseModule';
import { HealthController } from './controller/HealthController';
import { AuthModule } from '@/auth/AuthModule';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    CoreModule,
    TodoModule,
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
