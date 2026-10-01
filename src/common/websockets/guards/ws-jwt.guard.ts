import { CanActivate, ExecutionContext, Injectable, Inject, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import {
  TOKEN_SERVICE,
  type ITokenService,
  type TokenPayload,
} from '../../../module/auth/application/ports/token-service.port.js';

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: TokenPayload;
    [key: string]: unknown;
  };
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    const token = this.extractToken(client);

    if (!token) {
      throw new WsException('Token d\'authentification manquant sur la connexion WebSocket');
    }

    try {
      const payload = await this.tokenService.verifyAccessToken(token);
      client.data.user = payload;
      return true;
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.warn(`Échec de validation JWT WebSocket: ${error.message}`);
      throw new WsException('Session expirée ou token invalide');
    }
  }

  private extractToken(client: Socket): string | null {
    const authHeader =
      client.handshake?.auth?.token ||
      client.handshake?.headers?.authorization ||
      client.handshake?.query?.token;

    if (!authHeader) {
      return null;
    }

    const tokenString = Array.isArray(authHeader) ? authHeader[0] : (authHeader as string);
    if (tokenString.startsWith('Bearer ')) {
      return tokenString.substring(7).trim();
    }
    return tokenString.trim();
  }
}
