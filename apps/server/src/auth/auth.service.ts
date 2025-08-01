import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '@/user/user.service';
import { User } from '@/user/entity/user.entity';
import { SignUpDto, SignInDto } from './dto';
import { JwtUserBasicPayload, JwtUserPayload } from './interface';
import {
  AccessTokenJwtService,
  RefreshTokenJwtService,
  AccessTokenService,
  RefreshTokenService,
} from '@/token';
import { InjectCurrentUser } from './current-user';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private accessTokenJwtService: AccessTokenJwtService,
    private accessTokenService: AccessTokenService,
    private refreshTokenService: RefreshTokenService,
    // TODO: should not expose refreshTokenJwtService
    private refreshTokenJwtService: RefreshTokenJwtService,
    @InjectCurrentUser()
    private _currentUser: () => User,
  ) {}

  static mockServiceWithSpecifiedCurrentUser(currentUser: User) {
    return {
      provide: AuthService,
      useValue: { currentUser },
    };
  }

  get currentUser() {
    return this._currentUser();
  }

  async signUp(dto: SignUpDto) {
    const user = await this.userService.create(dto);
    return user.id;
  }

  async signIn(dto: SignInDto) {
    const user = await this.validateUserEmail(dto.email, dto.password);

    return this.generateTokens(user);
  }

  private async generateTokens(user: User) {
    const payload = await this.getUserTokenPayload(user);

    const [accessToken, refreshToken] = await Promise.all([
      this.accessTokenJwtService.signAsync(payload),
      this.refreshTokenService.generate(payload),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async getUserTokenPayload(user: User) {
    const payload: JwtUserBasicPayload = {
      sub: user.id,
      email: user.email,
      device: await this.getCurrentDeviceFingerprint(),
      geoLocation: await this.getCurrentGeoLocationFingerprint(),
      version: await this.getCurrentVersionFingerprint(),
    };
    return payload;
  }

  async verifyRefreshToken(token: string) {
    const payload =
      await this.refreshTokenJwtService.verifyAsync<JwtUserPayload>(token);

    await Promise.all([
      this.verifyRefreshTokenVersion(payload),
      this.verifyRefreshTokenDeviceFingerprint(payload),
      this.verifyRefreshTokenGeoLocation(payload),
    ]);

    return payload;
  }

  async verifyRefreshTokenVersion(payload: JwtUserPayload) {
    const currentFingerPrint = await this.getCurrentVersionFingerprint();

    if (payload.version !== currentFingerPrint) {
      throw new UnauthorizedException('version mismatch');
    }
  }

  getCurrentVersion() {
    return '1.0.0'; // This can be replaced with a dynamic version retrieval logic
  }

  getCurrentVersionFingerprint() {
    // This function can be used to get the current version of the application
    // For example, you can use a service to get the app version
    // Currently, it does nothing but can be implemented as needed
    return bcrypt.hash(this.getCurrentVersion(), 10); // Example version, replace with actual logic if needed
  }

  /**
   * verify geo location change
   */
  async verifyRefreshTokenGeoLocation(payload: JwtUserPayload) {
    const currentFingerPrint = await this.getCurrentGeoLocationFingerprint();

    if (payload.geoLocation !== currentFingerPrint) {
      throw new UnauthorizedException('Geo location mismatch');
    }
  }

  getCurrentGeoLocationFingerprint() {
    return bcrypt.hash(JSON.stringify(this.getCurrentGeoLocation()), 10);
  }

  getCurrentGeoLocation() {
    // This function can be used to get the current geo-location of the user
    // For example, you can use a service to get the user's IP address and resolve it to a location
    // Currently, it does nothing but can be implemented as needed
    return {
      country: 'implement country detection',
      city: 'implement city detection',
      ip: 'implement IP detection',
    };
  }

  async verifyRefreshTokenDeviceFingerprint(payload: JwtUserPayload) {
    const currentFingerPrint = await this.getCurrentDeviceFingerprint();

    if (payload.device !== currentFingerPrint) {
      throw new UnauthorizedException('Device fingerprint mismatch');
    }
  }

  getCurrentDeviceFingerprint() {
    return bcrypt.hash(JSON.stringify(this.getCurrentDevice()), 10);
  }

  getCurrentDevice() {
    // This function can be used to get the current device information
    // For example, you can get the device type, OS, browser, etc.
    // Currently, it does nothing but can be implemented as needed
    return {
      deviceType: 'implement device type detection',
      os: 'implement OS detection',
      browser: 'implement browser detection',
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.verifyRefreshToken(token);

      const isRevoked = await this.refreshTokenService.isTokenRevoked(token);
      if (isRevoked) {
        await this.refreshTokenService.revokeAllUserTokens(payload.sub);
        throw new Error('Refresh token has been revoked');
      }

      const user = await this.userService.findUserById(payload.sub);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // refresh token rotation
      await this.refreshTokenService.revokeToken(token);

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
      const payload =
        await this.accessTokenJwtService.verifyAsync<JwtUserPayload>(
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
      await this.accessTokenService.addToBlacklist(accessToken, payload.exp);
      await this.userService.incrementTokenVersion(user.id);

      return 'Logged out successfully';
    } catch (e: any) {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
