import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RefreshTokenRepository } from '../repository/refresh-token.repository';

@Injectable()
export class CleanupTokensTask {
  constructor(private refreshTokenRepo: RefreshTokenRepository) {}

  /**
   * Runs every day at midnight
   */
  @Cron('0 0 * * *')
  async cleanup() {
    await this.refreshTokenRepo.cleanupExpiredTokens();
    console.log('Expired tokens cleaned up successfully');
  }
}
