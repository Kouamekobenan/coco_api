import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HealthController } from './health.controller.js';
import type { HealthCheckService, PrismaHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import type { PrismaService } from '../../prisma/prisma.service.js';
import type { RedisHealthIndicator } from './redis.health-indicator.js';

describe('HealthController', () => {
  let controller: HealthController;
  let mockHealth: Partial<HealthCheckService>;
  let mockPrismaHealth: Partial<PrismaHealthIndicator>;
  let mockMemoryHealth: Partial<MemoryHealthIndicator>;
  let mockPrisma: Partial<PrismaService>;
  let mockRedisHealth: Partial<RedisHealthIndicator>;

  beforeEach(() => {
    mockHealth = {
      check: vi.fn().mockImplementation(async (indicators) => {
        const results = await Promise.all(indicators.map((fn: () => any) => fn()));
        return {
          status: 'ok',
          info: Object.assign({}, ...results),
          error: {},
          details: Object.assign({}, ...results),
        };
      }),
    };

    mockPrismaHealth = {
      pingCheck: vi.fn().mockResolvedValue({ database: { status: 'up' } }),
    };

    mockMemoryHealth = {
      checkHeap: vi.fn().mockResolvedValue({ memory_heap: { status: 'up' } }),
    };

    mockRedisHealth = {
      isHealthy: vi.fn().mockResolvedValue({ redis: { status: 'up', response: 'PONG' } }),
    };

    mockPrisma = {};

    controller = new HealthController(
      mockHealth as HealthCheckService,
      mockPrismaHealth as PrismaHealthIndicator,
      mockMemoryHealth as MemoryHealthIndicator,
      mockPrisma as PrismaService,
      mockRedisHealth as RedisHealthIndicator,
    );
  });

  it('doit renvoyer un statut ok si la base et redis sont opérationnels', async () => {
    const result = await controller.check();

    expect(result.status).toBe('ok');
    expect(mockPrismaHealth.pingCheck).toHaveBeenCalledWith('database', mockPrisma);
    expect(mockRedisHealth.isHealthy).toHaveBeenCalledWith('redis');
    expect(mockMemoryHealth.checkHeap).toHaveBeenCalled();
  });
});
