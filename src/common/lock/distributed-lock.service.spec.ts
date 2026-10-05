import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DistributedLockService } from './distributed-lock.service.js';
import { ConfigService } from '@nestjs/config';

describe('DistributedLockService', () => {
  let lockService: DistributedLockService;
  let mockConfigService: ConfigService;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn().mockReturnValue(null),
    } as unknown as ConfigService;

    lockService = new DistributedLockService(mockConfigService);
  });

  it('doit acquérir et libérer un verrou en mode mémoire locale', async () => {
    const lockKey = 'lock:test:staff-1';
    const lockId = await lockService.acquireLock(lockKey, 2000, 2, 50);

    expect(lockId).toBeDefined();
    expect(typeof lockId).toBe('string');

    // Deuxième tentative immédiate sur la même clé doit échouer (verrou actif)
    const lockId2 = await lockService.acquireLock(lockKey, 2000, 2, 20);
    expect(lockId2).toBeNull();

    // Libération du verrou
    const released = await lockService.releaseLock(lockKey, lockId!);
    expect(released).toBe(true);

    // Une nouvelle tentative après libération doit réussir
    const lockId3 = await lockService.acquireLock(lockKey, 2000, 2, 50);
    expect(lockId3).toBeDefined();
    await lockService.releaseLock(lockKey, lockId3!);
  });

  it('doit exécuter une fonction protégée par withLock et libérer automatiquement', async () => {
    const lockKey = 'lock:test:withlock';
    let executed = false;

    const result = await lockService.withLock(lockKey, async () => {
      executed = true;
      return 'SUCCESS';
    });

    expect(result).toBe('SUCCESS');
    expect(executed).toBe(true);

    // Le verrou doit avoir été libéré par le bloc finally
    const newLock = await lockService.acquireLock(lockKey, 2000, 1, 10);
    expect(newLock).toBeDefined();
    await lockService.releaseLock(lockKey, newLock!);
  });

  it('doit libérer le verrou même si la fonction passée à withLock lève une exception', async () => {
    const lockKey = 'lock:test:error';

    await expect(
      lockService.withLock(lockKey, async () => {
        throw new Error('Erreur métier imprévue');
      }),
    ).rejects.toThrow('Erreur métier imprévue');

    // Le verrou doit être libre immédiatement
    const newLock = await lockService.acquireLock(lockKey, 2000, 1, 10);
    expect(newLock).toBeDefined();
    await lockService.releaseLock(lockKey, newLock!);
  });
});
