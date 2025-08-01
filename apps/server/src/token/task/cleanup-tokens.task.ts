import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RefreshTokenService } from '../service';

@Injectable()
export class CleanupTokensTask {
  constructor(private refreshTokenService: RefreshTokenService) {}

  /**
   * Runs every day at midnight
   */
  @Cron('0 0 * * *')
  async cleanup() {
    await this.refreshTokenService.cleanupExpiredTokens();
    console.log('Expired tokens cleaned up successfully');
  }
}
