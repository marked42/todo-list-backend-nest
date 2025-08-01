import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RefreshTokenService } from '../service/refresh-token.service';

@Injectable()
export class CleanupTokensTask {
  constructor(private refreshTokenRepo: RefreshTokenService) {}

  /**
   * Runs every day at midnight
   */
  @Cron('0 0 * * *')
  async cleanup() {
    await this.refreshTokenRepo.cleanupExpiredTokens();
    console.log('Expired tokens cleaned up successfully');
  }
}
