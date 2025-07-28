import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '@/user/user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtConfig } from './jwt.config';
import { ConfigType } from '@nestjs/config';
import { User } from '@/user/entity/user.entity';
import { JwtUserPayload } from './model';
import { TokenBlacklistService } from './token-blacklist.service';
import { RefreshTokenRepository } from './repository/refresh-token.repository';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject(JwtConfig.KEY)
    private jwtConfig: ConfigType<typeof JwtConfig>,
    private tokenBlacklistService: TokenBlacklistService,
    private refreshTokenRepo: RefreshTokenRepository,
  ) {}

  async signUp(dto: SignUpDto) {
    const user = await this.userService.create(dto);
    return user.id;
  }

  async signIn(dto: SignInDto) {
    const user = await this.validateUserEmail(dto.email, dto.password);

    return this.generateTokens(user);
  }

  private async generateTokens(user: User) {
    const payload = {
      email: user.email,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(
        user.id,
        {
          expiresIn: this.jwtConfig.accessTokenTtl,
          secret: this.jwtConfig.accessTokenSecret,
        },
        payload,
      ),
      this.signToken(
        user.id,
        {
          expiresIn: this.jwtConfig.refreshTokenTtl,
          secret: this.jwtConfig.refreshTokenSecret,
        },
        payload,
      ),
    ]);
    const refreshTokenPayload =
      this.jwtService.decode<JwtUserPayload>(refreshToken);

    // TODO: reuse refresh token and limit the number of refresh tokens per user
    await this.refreshTokenRepo.saveToken(
      refreshToken,
      user.id,
      refreshTokenPayload.exp,
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  private async signToken<T>(
    userId: number,
    options: { expiresIn: string | number; secret: string },
    payload?: T,
  ) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      options,
    );
  }

  async refreshToken(token: string) {
    try {
      // TODO: distinguish access token / refresh token jwt service
      const payload = await this.jwtService.verifyAsync<JwtUserPayload>(token, {
        secret: this.jwtConfig.refreshTokenSecret,
      });

      const isRevoked = await this.refreshTokenRepo.isTokenRevoked(token);
      if (isRevoked) {
        throw new Error('Refresh token has been revoked');
      }

      const user = await this.userService.findUserById(payload.sub);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // refresh token rotation
      await this.refreshTokenRepo.revokeToken(token);

      return this.generateTokens(user);
    } catch (_e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUserEmail(email: string, password: string) {
    // 1. 查看用户是否存在
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException(`用户${email}不存在`);
    }

    // 2. 用户密码是否有效
    const matched = await bcrypt.compare(password, user.encryptedPassword);

    if (!matched) {
      throw new UnauthorizedException('密码错误');
    }

    return user;
  }

  async signOut(accessToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtUserPayload>(
        accessToken,
        {
          // sign out should work even if the access token is expired, so ignore expiration
          ignoreExpiration: true,
        },
      );
      const user = await this.userService.findUserById(payload.sub);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // black list access token and leave refresh token intact
      await this.tokenBlacklistService.addToBlacklist(accessToken, payload.exp);

      return 'Logged out successfully';
    } catch (e: any) {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
