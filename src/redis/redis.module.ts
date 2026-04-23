import {
  Global,
  Inject,
  Module,
  type OnApplicationShutdown,
} from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../config/config.service.js';

export const REDIS = Symbol('REDIS');

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: (config: AppConfigService): Redis => {
        const client = new Redis(config.get('REDIS_URL'), {
          // Si un comando no responde en 2s, lo abortamos. Evita que cada
          // request a la API espere el timeout TCP cuando Redis está caído
          // o inaccesible (ej. DNS roto). Los servicios que lo consumen
          // (rate-limit, abuse-detection) ya hacen fail-open.
          commandTimeout: 2000,
          maxRetriesPerRequest: 1,
          lazyConnect: true,
          // Cap reintentos: con DNS roto o red caída, ioredis hace backoff
          // infinito y saturamos logs. Abandonamos tras 5 intentos (~5s).
          retryStrategy: (times) => {
            if (times > 5) return null;
            return Math.min(times * 500, 3000);
          },
          reconnectOnError: () => false,
        });

        // No-op handler para evitar "Unhandled error event" cuando
        // Upstash/Redis no es alcanzable (DNS, VPN, outage). Los consumidores
        // (rate-limit, abuse-detection) ya degradan grácilmente si el
        // comando falla.
        client.on('error', (err) => {
          // eslint-disable-next-line no-console
          console.warn(
            '[redis] error (degraded mode):',
            err instanceof Error ? err.message : err,
          );
        });

        return client;
      },
      inject: [AppConfigService],
    },
  ],
  exports: [REDIS],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async onApplicationShutdown(): Promise<void> {
    // `quit` flushes pending commands before closing; `disconnect` is a
    // hard cut. Prefer quit to avoid dropping in-flight writes on graceful
    // shutdowns (e.g. Vercel redeploy, SIGTERM).
    try {
      await this.redis.quit();
    } catch {
      this.redis.disconnect();
    }
  }
}
