import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import database from '@/config/database';
import { CoreModule } from '@/core/CoreModule';
import { TodoModule } from '@/todo/TodoModule';
import { TypeOrmConfigService } from './TypeOrmConfigService';

@Module({
  imports: [
    CoreModule,
    TodoModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [database],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
