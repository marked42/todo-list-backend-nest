import { Module } from '@nestjs/common';
import { CoreModule } from './core/CoreModule';
import { TodoModule } from './todo/TodoModule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './core/entity/User';

@Module({
  imports: [
    CoreModule,
    TodoModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root1234',
      database: 'todolist',
      // autoLoadEntities: true,
      entities: [User],
      synchronize: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
