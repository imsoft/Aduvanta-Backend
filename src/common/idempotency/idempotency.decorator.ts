import { SetMetadata } from '@nestjs/common';

export const IDEMPOTENCY_KEY = 'idempotency';

/**
 * Marks a mutation endpoint as idempotent.
 *
 * When applied, the IdempotencyGuard will:
 * 1. Check for an `Idempotency-Key` header
 * 2. If a request with the same key is already in-flight, block with 409
 * 3. If a completed response exists for the key, return the cached response
 * 4. Otherwise, allow the request and cache the response
 *
 * The lockTtlMs parameter controls how long the lock/response is cached.
 *
 * Usage:
 *   @Idempotent(30000) // 30 second lock
 *   @Post()
 *   async create(@Body() dto: CreateDto) { ... }
 */
export function Idempotent(lockTtlMs: number = 30_000) {
  return SetMetadata(IDEMPOTENCY_KEY, { lockTtlMs });
}
