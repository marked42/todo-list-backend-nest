import { DatabaseConfig } from '@/database/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // TODO: use forFeature
    TypeOrmModule.forRootAsync(DatabaseConfig.asProvider()),
  ],
})
export class DatabaseModule {}
