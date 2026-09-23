import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '../../application/ports/token-service.port.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'coco-super-secret-jwt-key-2026',
    });
  }

  public validate(payload: TokenPayload): TokenPayload {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Token JWT invalide ou expiré.');
    }
    return payload;
  }
}
