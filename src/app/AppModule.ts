import { Module } from '@nestjs/common';
import { CoreModule } from '@/core/CoreModule';
import { TodoModule } from '@/todo/TodoModule';
import { AppConfigModule } from '@/config/AppConfigModule';
import { DatabaseModule } from '@/database/DatabaseModule';

@Module({
  imports: [AppConfigModule, DatabaseModule, CoreModule, TodoModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
