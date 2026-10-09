import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUserUseCase } from './register-user.usecase.js';
import { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { IPasswordHasher } from '../ports/password-hasher.port.js';
import { ITokenService } from '../ports/token-service.port.js';
import {
  UserAlreadyExistsException,
  UserEmailAlreadyExistsException,
} from '../../domain/exceptions/domain.exception.js';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let mockUserRepo: {
    existsByPhone: ReturnType<typeof vi.fn>;
    existsByEmail: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let mockPasswordHasher: {
    hash: ReturnType<typeof vi.fn>;
    compare: ReturnType<typeof vi.fn>;
  };
  let mockTokenService: {
    generateTokens: ReturnType<typeof vi.fn>;
    verifyAccessToken: ReturnType<typeof vi.fn>;
    verifyRefreshToken: ReturnType<typeof vi.fn>;
  };
  let mockEventEmitter: {
    emit: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockUserRepo = {
      existsByPhone: vi.fn().mockResolvedValue(false),
      existsByEmail: vi.fn().mockResolvedValue(false),
      save: vi.fn().mockResolvedValue(undefined),
    };
    mockPasswordHasher = {
      hash: vi.fn().mockResolvedValue('$2b$12$hashedPassword'),
      compare: vi.fn(),
    };
    mockTokenService = {
      generateTokens: vi.fn().mockResolvedValue({
        accessToken: 'jwt-access-token',
        refreshToken: 'jwt-refresh-token',
        expiresIn: 3600,
      }),
      verifyAccessToken: vi.fn(),
      verifyRefreshToken: vi.fn(),
    };
    mockEventEmitter = {
      emit: vi.fn(),
    };

    useCase = new RegisterUserUseCase(
      mockUserRepo as unknown as IUserRepository,
      mockPasswordHasher as unknown as IPasswordHasher,
      mockTokenService as unknown as ITokenService,
      undefined,
      mockEventEmitter as unknown as any,
    );
  });

  it('should successfully register a new user and return tokens with profile', async () => {
    const dto = {
      phone: '+2250701020304',
      password: 'SecurePassword123!',
      email: 'test@example.ci',
      firstName: 'Awa',
      lastName: 'Kouassi',
    };

    const result = await useCase.execute(dto);

    expect(mockUserRepo.existsByPhone).toHaveBeenCalled();
    expect(mockUserRepo.existsByEmail).toHaveBeenCalledWith('test@example.ci');
    expect(mockUserRepo.save).toHaveBeenCalledOnce();
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      'auth.user.registered',
      expect.objectContaining({
        phone: '+2250701020304',
        email: 'test@example.ci',
        firstName: 'Awa',
        lastName: 'Kouassi',
      }),
    );
    expect(result.accessToken).toBe('jwt-access-token');
    expect(result.user.email).toBe('test@example.ci');
    expect(result.user.firstName).toBe('Awa');
  });

  it('should throw UserAlreadyExistsException when phone number is already registered', async () => {
    mockUserRepo.existsByPhone.mockResolvedValue(true);

    const dto = {
      phone: '+2250701020304',
      password: 'SecurePassword123!',
      email: 'test@example.ci',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(UserAlreadyExistsException);
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });

  it('should throw UserEmailAlreadyExistsException when email is already registered', async () => {
    mockUserRepo.existsByPhone.mockResolvedValue(false);
    mockUserRepo.existsByEmail.mockResolvedValue(true);

    const dto = {
      phone: '+2250701020304',
      password: 'SecurePassword123!',
      email: 'existing@example.ci',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(UserEmailAlreadyExistsException);
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });

  it('should register successfully without email if email is not provided', async () => {
    const dto = {
      phone: '+2250701020304',
      password: 'SecurePassword123!',
    };

    const result = await useCase.execute(dto);

    expect(mockUserRepo.existsByEmail).not.toHaveBeenCalled();
    expect(mockUserRepo.save).toHaveBeenCalledOnce();
    expect(result.user.email).toBeNull();
  });
});
