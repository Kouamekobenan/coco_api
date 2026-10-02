import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { QUEUE_NAMES } from './queue.constants.js';

const logger = new Logger('AppQueueModule');

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
        const redisPort = Number(configService.get<number>('REDIS_PORT', 6379));
        const redisPassword = configService.get<string>('REDIS_PASSWORD');

        if (redisUrl && redisUrl.startsWith('redis')) {
          try {
            const parsed = new URL(redisUrl);
            const isTls = parsed.protocol === 'rediss:';
            return {
              connection: {
                host: parsed.hostname,
                port: parsed.port ? parseInt(parsed.port, 10) : 6379,
                username: parsed.username || undefined,
                password: parsed.password || undefined,
                tls: isTls ? { rejectUnauthorized: false } : undefined,
                maxRetriesPerRequest: null,
                enableReadyCheck: false,
                lazyConnect: true,
                retryStrategy: (times: number) => {
                  if (times > 10) {
                    logger.warn('⚠️ Connexion Redis en attente (mode hors-ligne ou configuration requise)');
                    return 15000;
                  }
                  return Math.min(times * 1000, 10000);
                },
              },
            };
          } catch {
            logger.warn('⚠️ URL REDIS_URL invalide, repli sur REDIS_HOST/REDIS_PORT');
          }
        }

        return {
          connection: {
            host: redisHost,
            port: redisPort,
            password: redisPassword || undefined,
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            lazyConnect: true,
            retryStrategy: (times: number) => {
              if (times > 10) {
                logger.warn('⚠️ Connexion Redis en attente (mode hors-ligne ou configuration requise)');
                return 15000;
              }
              return Math.min(times * 1000, 10000);
            },
          },
        };
      },
    }),

    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),

    BullModule.registerQueue(
      {
        name: QUEUE_NAMES.QUEUE_LIFECYCLE,
      },
      {
        name: QUEUE_NAMES.NOTIFICATIONS,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      },
    ),

    BullBoardModule.forFeature(
      {
        name: QUEUE_NAMES.QUEUE_LIFECYCLE,
        adapter: BullMQAdapter,
      },
      {
        name: QUEUE_NAMES.NOTIFICATIONS,
        adapter: BullMQAdapter,
      },
    ),
  ],
  exports: [BullModule, BullBoardModule],
})
export class AppQueueModule {}
