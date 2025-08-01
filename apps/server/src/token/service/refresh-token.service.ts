import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Not, Repository } from 'typeorm';
import { RefreshTokenEntity } from '../entity/refresh-token.entity';

export function secondsToDate(seconds: number) {
  return new Date(seconds * 1000);
}

export const MAX_REFRESH_TOKENS_PER_USER = 5;

@Injectable()
export class RefreshTokenService {
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

  /**
   * limit max number of refresh tokens per user
   */
  async limitUserRefreshTokens(userId: number) {
    const count = await this.refreshTokenRepository.countBy({
      userId,
      revoked: false,
    });
    if (count >= MAX_REFRESH_TOKENS_PER_USER) {
      // Logic to handle exceeding the limit, e.g., delete oldest tokens
      const token = await this.refreshTokenRepository.findOne({
        where: { userId, revoked: false },
        order: { expiresAt: 'ASC' },
      });
      if (token) {
        await this.refreshTokenRepository.remove([token]);
      }
    }
  }

  async revokeAllUserTokensExcept(userId: number, exceptToken: string) {
    await this.refreshTokenRepository.update(
      { userId, token: Not(exceptToken) },
      { revoked: true },
    );
  }

  async revokeAllUserTokens(userId: number) {
    await this.refreshTokenRepository.update({ userId }, { revoked: true });
  }

  async count(options?: FindManyOptions<RefreshTokenEntity>) {
    return this.refreshTokenRepository.count(options);
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
