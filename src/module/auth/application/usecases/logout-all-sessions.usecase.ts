import { Inject, Injectable } from '@nestjs/common';
import type { ISessionRepository } from '../../domain/repositories/session.repository.interface.js';
import { SESSION_REPOSITORY } from '../../domain/repositories/session.repository.interface.js';

@Injectable()
export class LogoutAllSessionsUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  public async execute(userId: string): Promise<{ message: string; revokedCount: number }> {
    const revokedCount = await this.sessionRepository.revokeAllForUser(userId);
    return {
      message: 'Toutes les sessions ont été déconnectées avec succès.',
      revokedCount,
    };
  }
}
