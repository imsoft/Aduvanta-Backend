import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import Redis from 'ioredis';
import { REDIS } from '../../redis/redis.module';
import type { Request } from 'express';

/**
 * Interceptor that marks idempotency locks as "done" after successful response.
 *
 * Works together with IdempotencyGuard:
 * - Guard acquires the lock ("processing")
 * - This interceptor marks it "done" after the handler completes
 * - On error, the lock is released so the client can retry
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const lockKey = (request as Request & { idempotencyLockKey?: string })
      .idempotencyLockKey;

    if (!lockKey) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => {
          // Success — mark as done (keep TTL for dedup window)
          this.redis
            .set(lockKey, 'done', 'KEEPTTL')
            .catch((err) =>
              this.logger.error(
                { err, lockKey },
                'Failed to mark idempotency key as done',
              ),
            );
        },
        error: () => {
          // Error — release lock so client can retry
          this.redis
            .del(lockKey)
            .catch((err) =>
              this.logger.error(
                { err, lockKey },
                'Failed to release idempotency lock after error',
              ),
            );
        },
      }),
    );
  }
}
