import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      // must be global for any module to use load typeorm repository correctly
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppConfigModule {}
