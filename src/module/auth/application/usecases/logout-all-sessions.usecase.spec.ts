import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogoutAllSessionsUseCase } from './logout-all-sessions.usecase.js';
import type { ISessionRepository } from '../../domain/repositories/session.repository.interface.js';

describe('LogoutAllSessionsUseCase', () => {
  let useCase: LogoutAllSessionsUseCase;
  let mockSessionRepo: {
    revokeAllForUser: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockSessionRepo = {
      revokeAllForUser: vi.fn().mockResolvedValue(3),
    };

    useCase = new LogoutAllSessionsUseCase(mockSessionRepo as unknown as ISessionRepository);
  });

  it('should revoke all active sessions for the specified user', async () => {
    const result = await useCase.execute('user-789');

    expect(mockSessionRepo.revokeAllForUser).toHaveBeenCalledWith('user-789');
    expect(result).toEqual({
      message: 'Toutes les sessions ont été déconnectées avec succès.',
      revokedCount: 3,
    });
  });
});
