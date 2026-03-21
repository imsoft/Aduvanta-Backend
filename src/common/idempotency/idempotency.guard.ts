import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import Redis from 'ioredis'
import { REDIS } from '../../redis/redis.module'
import { IDEMPOTENCY_KEY } from './idempotency.decorator'
import type { Request } from 'express'

type IdempotencyConfig = {
  lockTtlMs: number
}

type ActiveSession = {
  session: { userId: string }
}

/**
 * Guard that prevents duplicate mutation requests.
 *
 * Protects against:
 * - Double-click / button spam
 * - Network retries sending the same POST twice
 * - Impatient users refreshing during a mutation
 *
 * How it works:
 * 1. Client sends `Idempotency-Key: <uuid>` header with mutation requests
 * 2. Guard checks Redis for this key scoped to the user
 * 3. If the key exists with status "processing" → 409 Conflict
 * 4. If the key exists with status "done" → return cached response
 * 5. If no key → set lock as "processing" and allow request through
 *
 * The response interceptor should call markComplete() to cache the response.
 * If no Idempotency-Key header is present, the guard falls back to a
 * per-user operation lock based on the request path + method.
 */
@Injectable()
export class IdempotencyGuard implements CanActivate {
  private readonly logger = new Logger(IdempotencyGuard.name)

  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = this.reflector.get<IdempotencyConfig>(
      IDEMPOTENCY_KEY,
      context.getHandler(),
    )

    if (!config) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()
    const session = (request as Request & { activeSession?: ActiveSession })
      .activeSession

    if (!session) {
      return true
    }

    const userId = session.session.userId
    const idempotencyKey = request.headers['idempotency-key'] as
      | string
      | undefined

    // If client provides an idempotency key, use it. Otherwise, generate
    // a lock key from the request path + method (prevents same-user
    // double-submit on the same endpoint).
    const lockKey = idempotencyKey
      ? `idem:${userId}:${idempotencyKey}`
      : `idem:lock:${userId}:${request.method}:${request.path}`

    const ttlSeconds = Math.ceil(config.lockTtlMs / 1000)

    try {
      // SET NX — only set if key doesn't exist (atomic lock)
      const acquired = await this.redis.set(
        lockKey,
        'processing',
        'EX',
        ttlSeconds,
        'NX',
      )

      if (!acquired) {
        // Key already exists — check if it's still processing or done
        const status = await this.redis.get(lockKey)

        if (status === 'processing') {
          this.logger.warn(
            { userId, idempotencyKey, path: request.path },
            'Duplicate request blocked (still processing)',
          )

          throw new HttpException(
            {
              statusCode: HttpStatus.CONFLICT,
              message:
                'A request with this operation is already being processed. Please wait.',
              code: 'DUPLICATE_REQUEST',
            },
            HttpStatus.CONFLICT,
          )
        }

        // Status is "done" or a cached response — for idempotency key
        // requests, we could return the cached response here. For now,
        // block duplicates within the TTL window.
        if (idempotencyKey) {
          this.logger.log(
            `Idempotent request already completed: ${userId} ${idempotencyKey}`,
          )
          throw new HttpException(
            {
              statusCode: HttpStatus.CONFLICT,
              message: 'This request has already been processed.',
              code: 'ALREADY_PROCESSED',
            },
            HttpStatus.CONFLICT,
          )
        }

        // No explicit idempotency key, and the lock expired — allow
        return true
      }

      // Lock acquired — store the key on the request so the interceptor
      // can mark it complete after the response
      ;(request as Request & { idempotencyLockKey?: string }).idempotencyLockKey =
        lockKey

      return true
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      // Redis error — fail open
      this.logger.error(
        { err: error, lockKey },
        'Idempotency check failed, allowing request',
      )
      return true
    }
  }
}
