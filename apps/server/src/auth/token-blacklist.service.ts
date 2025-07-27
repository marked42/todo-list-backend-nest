import * as crypto from 'node:crypto';
import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { type Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';

@Injectable()
export class TokenBlacklistService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private redisClient: Redis;

  // TODO: should be in a separate module
  onApplicationBootstrap() {
    // TODO: use a real Redis instance in production
    this.redisClient = new RedisMock({
      host: process.env.REDIS_HOST || 'localhost',
      port: 6379,
    });
  }

  onApplicationShutdown(_signal?: string) {
    return this.redisClient.quit();
  }

  async addToBlacklist(token: string, expireAt: number) {
    const now = Math.floor(Date.now() / 1000);
    const ttl = expireAt - now;

    if (ttl > 0) {
      const tokenFingerprint = this.getTokenFingerprint(token);
      await this.redisClient.set(tokenFingerprint, '1', 'EX', ttl);
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = this.getTokenFingerprint(token);
    return (await this.redisClient.exists(key)) > 0;
  }

  private getTokenFingerprint(token: string) {
    const hash = crypto.createHash('sha256');
    return `blacklist:${hash.update(token).digest('hex')}`;
  }
}
