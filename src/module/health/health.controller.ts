import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RedisHealthIndicator } from './redis.health-indicator.js';
import { Public } from '../auth/infrastructure/security/public.decorator.js';

@ApiTags('App')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly memoryHealth: MemoryHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly redisHealth: RedisHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Vérifier la santé de l\'API (PostgreSQL, Redis, Mémoire)',
    description:
      'Endpoint utilisé par Railway et les moniteurs externes pour valider la connectivité aux services critiques.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tous les services critiques sont opérationnels.',
    schema: {
      example: {
        status: 'ok',
        info: {
          database: { status: 'up' },
          redis: { status: 'up', response: 'PONG' },
          memory_heap: { status: 'up' },
        },
        error: {},
        details: {
          database: { status: 'up' },
          redis: { status: 'up', response: 'PONG' },
          memory_heap: { status: 'up' },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Un ou plusieurs composants critiques sont défaillants.',
  })
  public check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => this.redisHealth.isHealthy('redis'),
      () => this.memoryHealth.checkHeap('memory_heap', 350 * 1024 * 1024),
    ]);
  }
}
