import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogoutUserUseCase } from './logout-user.usecase.js';
import type { ISessionRepository } from '../../domain/repositories/session.repository.interface.js';
import { SessionEntity } from '../../domain/entities/session.entity.js';

describe('LogoutUserUseCase', () => {
  let useCase: LogoutUserUseCase;
  let mockSessionRepo: {
    save: ReturnType<typeof vi.fn>;
    findByRefreshToken: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    revokeByRefreshToken: ReturnType<typeof vi.fn>;
    revokeAllForUser: ReturnType<typeof vi.fn>;
    findActiveByUserId: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockSessionRepo = {
      save: vi.fn(),
      findByRefreshToken: vi.fn(),
      findById: vi.fn(),
      revokeByRefreshToken: vi.fn().mockResolvedValue(true),
      revokeAllForUser: vi.fn().mockResolvedValue(1),
      findActiveByUserId: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockResolvedValue(undefined),
    };

    useCase = new LogoutUserUseCase(mockSessionRepo as unknown as ISessionRepository);
  });

  it('should revoke session specifically when refreshToken is provided', async () => {
    const result = await useCase.execute('user-123', { refreshToken: 'valid-refresh-token' });

    expect(mockSessionRepo.revokeByRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
    expect(result).toEqual({ message: 'Déconnexion réussie.' });
  });

  it('should find and revoke active session when no refreshToken is provided', async () => {
    const activeSession = SessionEntity.create({
      id: 'session-1',
      userId: 'user-123',
      refreshToken: 'token-abc',
      expiresAt: new Date(Date.now() + 3600000),
    });

    mockSessionRepo.findActiveByUserId.mockResolvedValue([activeSession]);

    const result = await useCase.execute('user-123');

    expect(mockSessionRepo.findActiveByUserId).toHaveBeenCalledWith('user-123');
    expect(mockSessionRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        isRevoked: expect.any(Function),
      }),
    );
    expect(activeSession.isRevoked()).toBe(true);
    expect(result).toEqual({ message: 'Déconnexion réussie.' });
  });

  it('should return success message even if no active sessions found', async () => {
    mockSessionRepo.findActiveByUserId.mockResolvedValue([]);

    const result = await useCase.execute('user-123');

    expect(mockSessionRepo.findActiveByUserId).toHaveBeenCalledWith('user-123');
    expect(mockSessionRepo.update).not.toHaveBeenCalled();
    expect(result).toEqual({ message: 'Déconnexion réussie.' });
  });
});
