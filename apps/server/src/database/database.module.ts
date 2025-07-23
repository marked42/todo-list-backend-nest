import { DataBaseConfigService } from '@/config/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: DataBaseConfigService,
    }),
  ],
})
export class DatabaseModule {}
