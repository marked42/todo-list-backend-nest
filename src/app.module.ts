import { Module } from '@nestjs/common';
import { CoreModule } from './core/CoreModule';
import { TodoModule } from './todo/TodoModule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './TypeOrmConfigService';
import { ConfigModule } from '@nestjs/config';
import database from './config/database';

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
