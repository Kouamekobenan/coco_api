import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { randomUUID } from 'node:crypto';

@Injectable()
export class DistributedLockService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DistributedLockService.name);
  private redis: Redis | null = null;
  private isConnected = false;
  // Fallback en mémoire locale si Redis est temporairement inaccessible
  private inMemoryLocks = new Set<string>();

  // Script Lua atomique garantissant que seul le détenteur du verrou peut le supprimer
  private readonly unlockLuaScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;

  constructor(private readonly configService: ConfigService) {}

  public async onModuleInit(): Promise<void> {
    await this.initRedis();
  }

  public async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.quit();
      } catch {
        this.redis.disconnect();
      }
    }
  }

  private async initRedis(): Promise<void> {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = Number(this.configService.get<number>('REDIS_PORT', 6379));
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

    try {
      if (redisUrl && redisUrl.startsWith('redis')) {
        const parsed = new URL(redisUrl);
        const isTls = parsed.protocol === 'rediss:';
        this.redis = new Redis({
          host: parsed.hostname,
          port: parsed.port ? parseInt(parsed.port, 10) : 6379,
          username: parsed.username || undefined,
          password: parsed.password || undefined,
          tls: isTls ? { rejectUnauthorized: false } : undefined,
          lazyConnect: true,
          connectTimeout: 5000,
          maxRetriesPerRequest: 1,
        });
      } else {
        this.redis = new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword || undefined,
          lazyConnect: true,
          connectTimeout: 5000,
          maxRetriesPerRequest: 1,
        });
      }

      this.redis.on('error', (err) => {
        if (!this.isConnected) return;
        this.logger.warn(`[DistributedLock] Problème de connexion Redis: ${err.message}`);
        this.isConnected = false;
      });

      this.redis.on('connect', () => {
        this.isConnected = true;
      });

      await this.redis.connect();
      this.isConnected = true;
      this.logger.log('✅ [DistributedLock] Connecté à Redis pour la synchronisation anti-concurrence');
    } catch (err: unknown) {
      this.isConnected = false;
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `⚠️ [DistributedLock] Redis distant non connecté (${msg}). Repli transparent sur verrous locaux en mémoire.`,
      );
    }
  }

  /**
   * Tente d'acquérir un verrou avec retry et backoff automatique.
   * @param key Clé unique de la ressource à verrouiller (ex: lock:booking:staff:123)
   * @param ttlMs Durée de validité du verrou en millisecondes (sécurité anti-deadlock)
   * @param retryCount Nombre de tentatives
   * @param retryDelayMs Délai entre chaque tentative
   * @returns Le token unique du verrou si acquis, ou null si échec
   */
  public async acquireLock(
    key: string,
    ttlMs = 5000,
    retryCount = 10,
    retryDelayMs = 150,
  ): Promise<string | null> {
    const lockId = randomUUID();

    for (let attempt = 0; attempt < retryCount; attempt++) {
      if (this.isConnected && this.redis) {
        try {
          // Commande atomique SET NX PX (uniquement si n'existe pas, avec TTL en ms)
          const result = await this.redis.set(key, lockId, 'PX', ttlMs, 'NX');
          if (result === 'OK') {
            return lockId;
          }
        } catch {
          // Erreur réseau passagère, tentative suivante
        }
      } else {
        // Fallback en mémoire locale
        if (!this.inMemoryLocks.has(key)) {
          this.inMemoryLocks.add(key);
          setTimeout(() => this.inMemoryLocks.delete(key), ttlMs);
          return lockId;
        }
      }

      // Petite attente aléatoire (jitter) pour éviter que plusieurs requêtes se réveillent pile en même temps
      const jitter = Math.floor(Math.random() * 40);
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs + jitter));
    }

    return null;
  }

  /**
   * Libère le verrou de manière sécurisée et atomique via Lua.
   */
  public async releaseLock(key: string, lockId: string): Promise<boolean> {
    if (this.isConnected && this.redis) {
      try {
        const res = await this.redis.eval(this.unlockLuaScript, 1, key, lockId);
        return res === 1;
      } catch (err) {
        this.logger.warn(`[DistributedLock] Erreur lors de la libération du verrou ${key}: ${err}`);
      }
    }

    this.inMemoryLocks.delete(key);
    return true;
  }

  /**
   * Exécute un traitement critique de manière sécurisée sous verrou distribué.
   * Garantit la libération automatique du verrou dans un bloc `finally`.
   */
  public async withLock<T>(
    key: string,
    fn: () => Promise<T>,
    ttlMs = 5000,
    retryCount = 12,
    retryDelayMs = 150,
  ): Promise<T> {
    const lockId = await this.acquireLock(key, ttlMs, retryCount, retryDelayMs);
    if (!lockId) {
      throw new Error(
        `LOCK_ACQUISITION_TIMEOUT: Impossible d'acquérir le verrou pour "${key}" (ressource actuellement occupée).`,
      );
    }

    try {
      return await fn();
    } finally {
      await this.releaseLock(key, lockId);
    }
  }
}
