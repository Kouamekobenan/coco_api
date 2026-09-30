import { Inject, Injectable } from '@nestjs/common';
import type { ISessionRepository } from '../../domain/repositories/session.repository.interface.js';
import { SESSION_REPOSITORY } from '../../domain/repositories/session.repository.interface.js';
import { LogoutDto } from '../dtos/logout.dto.js';

@Injectable()
export class LogoutUserUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  public async execute(userId: string, dto?: LogoutDto): Promise<{ message: string }> {
    if (dto?.refreshToken) {
      // Révocation ciblée de la session associée au refreshToken fourni
      await this.sessionRepository.revokeByRefreshToken(dto.refreshToken);
    } else {
      // Si aucun refresh token n'est spécifié, on révoque la dernière session active de l'utilisateur
      const activeSessions = await this.sessionRepository.findActiveByUserId(userId);
      if (activeSessions.length > 0) {
        const currentSession = activeSessions[0];
        currentSession.revoke();
        await this.sessionRepository.update(currentSession);
      }
    }

    return { message: 'Déconnexion réussie.' };
  }
}
