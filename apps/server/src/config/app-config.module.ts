import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from '@/config/database';
import { JwtConfig } from '@/auth/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      // must be global for any module to use load typeorm repository correctly
      isGlobal: true,
      // TODO: move jwt config to jwt module
      load: [DatabaseConfig, JwtConfig], // Load the JwtConfig here
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppConfigModule {}
