import { Module } from '@nestjs/common';
import { CoreModule } from '@/core/CoreModule';
import { TodoModule } from '@/todo/TodoModule';
import { AppConfigModule } from '@/config/AppConfigModule';

@Module({
  imports: [CoreModule, TodoModule, AppConfigModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
