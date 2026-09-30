import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshTokenUseCase } from './refresh-token.usecase.js';
import type { ISessionRepository } from '../../domain/repositories/session.repository.interface.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import type { ITokenService } from '../ports/token-service.port.js';
import { SessionEntity } from '../../domain/entities/session.entity.js';
import { UserEntity } from '../../domain/entities/user.entity.js';
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo.js';
import { Password } from '../../domain/value-objects/password.vo.js';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let mockSessionRepo: {
    findByRefreshToken: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let mockUserRepo: {
    findById: ReturnType<typeof vi.fn>;
  };
  let mockTokenService: {
    verifyRefreshToken: ReturnType<typeof vi.fn>;
    generateTokens: ReturnType<typeof vi.fn>;
  };

  const dummyUser = UserEntity.create({
    id: 'user-456',
    phone: PhoneNumber.create('+2250700000001'),
    password: Password.fromHash('$2b$12$hashedPassword'),
    firstName: 'Kouassi',
    lastName: 'Jean',
  });

  beforeEach(() => {
    mockSessionRepo = {
      findByRefreshToken: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
    };
    mockUserRepo = {
      findById: vi.fn().mockResolvedValue(dummyUser),
    };
    mockTokenService = {
      verifyRefreshToken: vi.fn().mockResolvedValue({ sub: 'user-456' }),
      generateTokens: vi.fn().mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 86400,
      }),
    };

    useCase = new RefreshTokenUseCase(
      mockSessionRepo as unknown as ISessionRepository,
      mockUserRepo as unknown as IUserRepository,
      mockTokenService as unknown as ITokenService,
    );
  });

  it('should successfully refresh tokens and rotate the session', async () => {
    const validSession = SessionEntity.create({
      id: 'session-123',
      userId: 'user-456',
      refreshToken: 'current-valid-token',
      expiresAt: new Date(Date.now() + 86400000), // expire demain
    });

    mockSessionRepo.findByRefreshToken.mockResolvedValue(validSession);

    const result = await useCase.execute({ refreshToken: 'current-valid-token' });

    expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith('current-valid-token');
    expect(mockSessionRepo.findByRefreshToken).toHaveBeenCalledWith('current-valid-token');
    expect(mockUserRepo.findById).toHaveBeenCalledWith('user-456');
    expect(mockSessionRepo.update).toHaveBeenCalledOnce();
    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(result.user.id).toBe('user-456');
    expect(validSession.getRefreshToken()).toBe('new-refresh-token');
  });

  it('should throw UnauthorizedException when token signature is invalid', async () => {
    mockTokenService.verifyRefreshToken.mockRejectedValue(new Error('Invalid signature'));

    await expect(
      useCase.execute({ refreshToken: 'corrupted-token' }),
    ).rejects.toThrow(UnauthorizedException);

    expect(mockSessionRepo.findByRefreshToken).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when session is not found in database', async () => {
    mockSessionRepo.findByRefreshToken.mockResolvedValue(null);

    await expect(
      useCase.execute({ refreshToken: 'unregistered-token' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when session is revoked', async () => {
    const revokedSession = SessionEntity.create({
      id: 'session-123',
      userId: 'user-456',
      refreshToken: 'revoked-token',
      expiresAt: new Date(Date.now() + 86400000),
    });
    revokedSession.revoke();

    mockSessionRepo.findByRefreshToken.mockResolvedValue(revokedSession);

    await expect(
      useCase.execute({ refreshToken: 'revoked-token' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when session has expired', async () => {
    const expiredSession = SessionEntity.create({
      id: 'session-123',
      userId: 'user-456',
      refreshToken: 'expired-token',
      expiresAt: new Date(Date.now() - 10000), // déjà expiré
    });

    mockSessionRepo.findByRefreshToken.mockResolvedValue(expiredSession);

    await expect(
      useCase.execute({ refreshToken: 'expired-token' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
