import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class RedisIoAdapter extends IoAdapter {
  protected override readonly logger = new Logger(RedisIoAdapter.name);
  private adapterConstructor?: ReturnType<typeof createAdapter>;
  private pubClient?: Redis;
  private subClient?: Redis;

  constructor(
    app: INestApplicationContext,
    private readonly configService: ConfigService,
  ) {
    super(app);
  }

  public async connectToRedis(): Promise<void> {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = Number(this.configService.get<number>('REDIS_PORT', 6379));
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

    try {
      if (redisUrl && redisUrl.startsWith('redis')) {
        const parsed = new URL(redisUrl);
        const isTls = parsed.protocol === 'rediss:';
        this.pubClient = new Redis({
          host: parsed.hostname,
          port: parsed.port ? parseInt(parsed.port, 10) : 6379,
          username: parsed.username || undefined,
          password: parsed.password || undefined,
          tls: isTls ? { rejectUnauthorized: false } : undefined,
          lazyConnect: true,
          connectTimeout: 5000,
        });
      } else {
        this.pubClient = new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword || undefined,
          lazyConnect: true,
          connectTimeout: 5000,
        });
      }

      await this.pubClient.connect();
      this.subClient = this.pubClient.duplicate();
      await this.subClient.connect();

      this.adapterConstructor = createAdapter(this.pubClient, this.subClient);
      this.logger.log('✅ Adaptateur Socket.io Redis connecté avec succès (Cluster/Multi-instances actif)');
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.warn(
        `⚠️ Impossible d'activer l'adaptateur Redis pour Socket.io (${error.message}). Repli sur l'adaptateur mémoire local.`,
      );
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: IoAdapter compatibilité de types Socket.io
  public override createIOServer(port: number, options?: any): any {
    const allowedOrigins = this.configService.get<string>('ALLOWED_ORIGINS')?.split(',') ?? '*';

    const serverOptions = {
      ...options,
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'], // Fallback polling pour réseaux mobiles faibles
    };

    const server = super.createIOServer(port, serverOptions);

    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }

    return server;
  }

  public async closeRedis(): Promise<void> {
    if (this.pubClient) {
      this.pubClient.disconnect();
    }
    if (this.subClient) {
      this.subClient.disconnect();
    }
  }
}
