import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from '../entity/refresh-token.entity';

export function secondsToDate(seconds: number) {
  return new Date(seconds * 1000);
}

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async saveToken(token: string, userId: number, expiresAt: number) {
    return this.refreshTokenRepository.save({
      token,
      userId,
      expiresAt: secondsToDate(expiresAt),
    });
  }

  async isTokenRevoked(token: string) {
    const refreshToken = await this.refreshTokenRepository.findOneBy({ token });
    return refreshToken ? refreshToken.revoked : false;
  }

  async revokeToken(token: string) {
    await this.refreshTokenRepository.update(
      { token },
      {
        revoked: true,
      },
    );
  }

  async cleanupExpiredTokens() {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .from(RefreshTokenEntity)
      .where('expiresAt < NOW()')
      .execute();
  }
}
