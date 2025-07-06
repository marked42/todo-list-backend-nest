import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import database from './database';

@Injectable()
export class DataBaseConfigService implements TypeOrmOptionsFactory {
  constructor(
    @Inject(database.KEY) private dbConfig: ConfigType<typeof database>,
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
