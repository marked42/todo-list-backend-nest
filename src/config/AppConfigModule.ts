import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataBaseConfigService } from '@/config/DataBaseConfigService';
import { ConfigModule } from '@nestjs/config';
import database from '@/config/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      // must be global for any module to use load typeorm repository correctly
      isGlobal: true,
      load: [database],
    }),
    TypeOrmModule.forRootAsync({
      useClass: DataBaseConfigService,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppConfigModule {}
