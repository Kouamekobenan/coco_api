import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisHealthIndicator {
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): Redis {
    if (!this.client) {
      const redisUrl = this.configService.get<string>('REDIS_URL');
      const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
      const redisPort = Number(this.configService.get<number>('REDIS_PORT', 6379));
      const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

      if (redisUrl && redisUrl.startsWith('redis')) {
        const parsed = new URL(redisUrl);
        const isTls = parsed.protocol === 'rediss:';
        this.client = new Redis({
          host: parsed.hostname,
          port: parsed.port ? parseInt(parsed.port, 10) : 6379,
          username: parsed.username || undefined,
          password: parsed.password || undefined,
          tls: isTls ? { rejectUnauthorized: false } : undefined,
          lazyConnect: true,
          connectTimeout: 3000,
          maxRetriesPerRequest: 1,
        });
      } else {
        this.client = new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword || undefined,
          lazyConnect: true,
          connectTimeout: 3000,
          maxRetriesPerRequest: 1,
        });
      }
    }
    return this.client;
  }

  public async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const client = this.getClient();
      if (client.status === 'wait') {
        await client.connect();
      }
      const response = await client.ping();
      const isUp = response === 'PONG';

      if (isUp) {
        return {
          [key]: {
            status: 'up',
            response,
          },
        };
      }

      const failResult: HealthIndicatorResult = {
        [key]: {
          status: 'down',
          response,
        },
      };
      throw new Error(`Redis ping failed with response: ${response}`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      throw new Error(`Redis check failed: ${errorMsg}`);
    }
  }
}
