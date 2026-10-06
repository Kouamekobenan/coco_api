import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ResetPasswordUseCase } from './reset-password.usecase.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import type { ISessionRepository } from '../../domain/repositories/session.repository.interface.js';
import type { IPasswordHasher } from '../ports/password-hasher.port.js';
import type { FirebaseAdminService } from '../../../../common/firebase/firebase-admin.service.js';
import { UserEntity } from '../../domain/entities/user.entity.js';
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo.js';
import { Password } from '../../domain/value-objects/password.vo.js';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let mockUserRepo: {
    findByPhone: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let mockPasswordHasher: {
    hash: ReturnType<typeof vi.fn>;
    compare: ReturnType<typeof vi.fn>;
  };
  let mockSessionRepo: {
    revokeAllForUser: ReturnType<typeof vi.fn>;
  };
  let mockFirebaseAdmin: {
    verifyIdToken: ReturnType<typeof vi.fn>;
  };

  const dummyUser = UserEntity.create({
    id: 'user-uuid-123',
    phone: PhoneNumber.create('+2250701020304'),
    password: Password.fromHash('$2b$12$oldHashedPassword'),
    firstName: 'Kouassi',
    lastName: 'Jean',
  });

  beforeEach(() => {
    mockUserRepo = {
      findByPhone: vi.fn().mockResolvedValue(dummyUser),
      update: vi.fn().mockResolvedValue(undefined),
    };
    mockPasswordHasher = {
      hash: vi.fn().mockResolvedValue('$2b$12$newHashedPassword'),
      compare: vi.fn(),
    };
    mockSessionRepo = {
      revokeAllForUser: vi.fn().mockResolvedValue(3),
    };
    mockFirebaseAdmin = {
      verifyIdToken: vi.fn().mockResolvedValue({
        uid: 'firebase-user-999',
        phone_number: '+2250701020304',
      }),
    };

    useCase = new ResetPasswordUseCase(
      mockUserRepo as unknown as IUserRepository,
      mockPasswordHasher as unknown as IPasswordHasher,
      mockSessionRepo as unknown as ISessionRepository,
      mockFirebaseAdmin as unknown as FirebaseAdminService,
    );
  });

  it('devrait réinitialiser le mot de passe avec succès, valider le téléphone et révoquer les sessions actives', async () => {
    const result = await useCase.execute({
      firebaseIdToken: 'valid-firebase-id-token',
      newPassword: 'NouveauSecret@2026',
    });

    expect(mockFirebaseAdmin.verifyIdToken).toHaveBeenCalledWith('valid-firebase-id-token');
    expect(mockUserRepo.findByPhone).toHaveBeenCalled();
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith('NouveauSecret@2026');
    expect(mockUserRepo.update).toHaveBeenCalled();
    expect(mockSessionRepo.revokeAllForUser).toHaveBeenCalledWith('user-uuid-123');

    expect(result.message).toContain('réinitialisé avec succès');
    expect(result.phone).toBe('+2250701020304');
    expect(result.sessionsRevoked).toBe(3);
  });

  it('devrait lever BadRequestException si le token Firebase ne contient aucun numéro de téléphone', async () => {
    mockFirebaseAdmin.verifyIdToken.mockResolvedValueOnce({
      uid: 'firebase-user-without-phone',
      phone_number: undefined,
    });

    await expect(
      useCase.execute({
        firebaseIdToken: 'token-no-phone',
        newPassword: 'NouveauSecret@2026',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('devrait lever BadRequestException si le numéro explicite dans le DTO ne correspond pas au numéro validé par Firebase', async () => {
    await expect(
      useCase.execute({
        firebaseIdToken: 'valid-firebase-id-token',
        phone: '+2250505050505', // Numéro différent de +2250701020304
        newPassword: 'NouveauSecret@2026',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('devrait lever NotFoundException si aucun utilisateur n’existe avec ce numéro de téléphone', async () => {
    mockUserRepo.findByPhone.mockResolvedValueOnce(null);

    await expect(
      useCase.execute({
        firebaseIdToken: 'valid-firebase-id-token',
        newPassword: 'NouveauSecret@2026',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('devrait propager UnauthorizedException si FirebaseAdmin rejette le jeton (expiré ou invalide)', async () => {
    mockFirebaseAdmin.verifyIdToken.mockRejectedValueOnce(
      new UnauthorizedException('Jeton Firebase expiré'),
    );

    await expect(
      useCase.execute({
        firebaseIdToken: 'expired-token',
        newPassword: 'NouveauSecret@2026',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
