import { getRedisConnectionToken, InjectRedis } from '@nestjs-modules/ioredis';
import { Module, OnApplicationShutdown } from '@nestjs/common';
// import { RedisModule } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';

@Module({
  imports: [
    // RedisModule.forRoot({
    //   type: 'single',
    //   options: {
    //     host: 'localhost',
    //     port: 6379,
    //     password: '123456',
    //   },
    // }),
  ],
  providers: [
    {
      provide: getRedisConnectionToken(),
      useFactory: () => {
        return new RedisMock({
          host: process.env.REDIS_HOST || 'localhost',
          port: 6379,
        });
      },
    },
  ],
  exports: [getRedisConnectionToken()],
})
export class RedisCacheModule implements OnApplicationShutdown {
  // TODO: use a real Redis instance in production
  constructor(@InjectRedis() private redisClient: Redis) {}

  onApplicationShutdown(_signal?: string) {
    return this.redisClient.quit();
  }
}
