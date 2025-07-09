import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

export const DatabaseConfig = registerAs('database', () => {
  return {
    type: process.env.DATABASE_TYPE || 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number.parseInt(process.env.DATABASE_PORT!) || 3306,
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    autoLoadEntities: true,
    synchronize: !!process.env.DATABASE_SYNCHRONIZE,
  };
});

@Injectable()
export class DataBaseConfigService implements TypeOrmOptionsFactory {
  constructor(
    @Inject(DatabaseConfig.KEY)
    private dbConfig: ConfigType<typeof DatabaseConfig>,
  ) {}

  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    return {
      // @ts-expect-error exact string type
      type: this.dbConfig.type,
      host: this.dbConfig.host,
      port: this.dbConfig.port,
      username: this.dbConfig.username,
      password: this.dbConfig.password,
      database: this.dbConfig.database,
      autoLoadEntities: true,
      synchronize: this.dbConfig.synchronize,
    };
  }
}
