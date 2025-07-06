import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from '@/config/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      // must be global for any module to use load typeorm repository correctly
      isGlobal: true,
      load: [DatabaseConfig],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppConfigModule {}
