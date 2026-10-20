import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterDeviceUseCase } from './register-device.usecase.js';
import type { PrismaService } from '../../../../prisma/prisma.service.js';

describe('RegisterDeviceUseCase', () => {
  let useCase: RegisterDeviceUseCase;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      userDevice: {
        upsert: vi.fn().mockResolvedValue({ id: 'device-record-1' }),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };
    useCase = new RegisterDeviceUseCase(mockPrisma as unknown as PrismaService);
  });

  it('enregistre ou met à jour un appareil avec son pushToken FCM', async () => {
    const result = await useCase.register('user-123', {
      deviceId: 'device-xyz',
      platform: 'android',
      pushToken: 'fcm-token-abc',
      appVersion: '1.0.0',
    });

    expect(result.success).toBe(true);
    expect(result.deviceId).toBe('device-xyz');
    expect(mockPrisma.userDevice.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_deviceId: {
            userId: 'user-123',
            deviceId: 'device-xyz',
          },
        },
      }),
    );
  });

  it('supprime un appareil lors de la déconnexion', async () => {
    const result = await useCase.unregister('user-123', 'device-xyz');

    expect(result.success).toBe(true);
    expect(mockPrisma.userDevice.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-123',
        deviceId: 'device-xyz',
      },
    });
  });
});
