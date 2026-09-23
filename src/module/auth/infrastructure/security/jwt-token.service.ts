import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ITokenService,
  TokenPayload,
  GeneratedTokens,
} from '../../application/ports/token-service.port.js';

@Injectable()
export class JwtTokenService implements ITokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpirationSeconds: number;
  private readonly refreshExpirationSeconds: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret = this.configService.get<string>('JWT_SECRET') ?? 'coco-super-secret-jwt-key-2026';
    this.refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') ?? 'coco-super-secret-refresh-key-2026';
    this.accessExpirationSeconds = 86400; // 24h
    this.refreshExpirationSeconds = 604800; // 7 jours
  }

  public async generateTokens(payload: TokenPayload): Promise<GeneratedTokens> {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: payload.sub,
        phone: payload.phone,
        universe: payload.universe,
        isSuperAdmin: payload.isSuperAdmin,
      },
      {
        secret: this.accessSecret,
        expiresIn: this.accessExpirationSeconds,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: payload.sub },
      {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpirationSeconds,
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessExpirationSeconds,
    };
  }

  public async verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync<TokenPayload>(token, {
      secret: this.accessSecret,
    });
  }

  public async verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync<TokenPayload>(token, {
      secret: this.refreshSecret,
    });
  }
}
