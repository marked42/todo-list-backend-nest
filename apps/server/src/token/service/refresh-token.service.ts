import { FindManyOptions, Not, Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { JwtUserBasicPayload, JwtUserPayload } from '@/auth';
import { RefreshTokenEntity } from '../entity/refresh-token.entity';
import { RefreshTokenConfig } from '../config/refresh-token.config';
import { RefreshTokenJwtService } from './refresh-token-jwt.service.ts';

export function secondsToDate(seconds: number) {
  return new Date(seconds * 1000);
}

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepo: Repository<RefreshTokenEntity>,
    @Inject(RefreshTokenConfig.KEY)
    private readonly refreshTokenConfig: ConfigType<typeof RefreshTokenConfig>,
    private readonly jwtService: RefreshTokenJwtService,
  ) {}

  async saveToken(token: string, userId: number, expiresAt: number) {
    return this.refreshTokenRepo.save({
      token,
      userId,
      expiresAt: secondsToDate(expiresAt),
    });
  }

  /**
   * limit max number of refresh tokens per user
   */
  async limitUserRefreshTokens(userId: number) {
    const count = await this.refreshTokenRepo.countBy({
      userId,
      revoked: false,
    });
    if (count >= this.refreshTokenConfig.maxTokenCountPerUser) {
      // Logic to handle exceeding the limit, e.g., delete oldest tokens
      const token = await this.refreshTokenRepo.findOne({
        where: { userId, revoked: false },
        order: { expiresAt: 'ASC' },
      });
      if (token) {
        await this.refreshTokenRepo.remove([token]);
      }
    }
  }

  getTokenExpiresAt(token: string) {
    const payload = this.jwtService.decode<JwtUserPayload>(token);
    return payload.exp;
  }

  async generate(payload: JwtUserBasicPayload) {
    const newToken = await this.jwtService.signAsync(payload);
    const expiresAt = this.getTokenExpiresAt(newToken);

    await this.limitUserRefreshTokens(payload.sub);
    await this.saveToken(newToken, payload.sub, expiresAt);

    return newToken;
  }

  async revokeAllUserTokensExcept(userId: number, exceptToken: string) {
    await this.refreshTokenRepo.update(
      { userId, token: Not(exceptToken) },
      { revoked: true },
    );
  }

  async revokeAllUserTokens(userId: number) {
    await this.refreshTokenRepo.update({ userId }, { revoked: true });
  }

  async count(options?: FindManyOptions<RefreshTokenEntity>) {
    return this.refreshTokenRepo.count(options);
  }

  async isTokenRevoked(token: string) {
    const refreshToken = await this.refreshTokenRepo.findOneBy({ token });
    return refreshToken ? refreshToken.revoked : false;
  }

  async revokeToken(token: string) {
    await this.refreshTokenRepo.update(
      { token },
      {
        revoked: true,
      },
    );
  }

  async cleanupExpiredTokens() {
    await this.refreshTokenRepo
      .createQueryBuilder()
      .delete()
      .from(RefreshTokenEntity)
      .where('expiresAt < NOW()')
      .execute();
  }
}
