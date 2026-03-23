import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS } from '../../redis/redis.module';
import { Logger } from '@nestjs/common';

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfterMs: number;
};

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  /**
   * Sliding window rate limiter using Redis sorted sets.
   *
   * More accurate than fixed window and avoids burst at window boundaries.
   * Each request is stored as a scored member where score = timestamp.
   * Old entries outside the window are pruned on every check.
   */
  async check(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - windowMs;
    const member = `${now}:${Math.random().toString(36).slice(2, 8)}`;

    try {
      const pipeline = this.redis.pipeline();

      // Remove entries outside the current window
      pipeline.zremrangebyscore(key, 0, windowStart);

      // Count current entries in window
      pipeline.zcard(key);

      // Add the current request
      pipeline.zadd(key, now, member);

      // Set TTL so keys auto-expire
      pipeline.pexpire(key, windowMs);

      const results = await pipeline.exec();

      if (!results) {
        // Redis pipeline failed — fail open
        this.logger.warn('Redis pipeline returned null, allowing request');
        return { allowed: true, remaining: limit, limit, retryAfterMs: 0 };
      }

      const currentCount = results[1]?.[1] as number;

      if (currentCount >= limit) {
        // Over limit — remove the optimistically added entry
        await this.redis.zrem(key, member);

        // Calculate retry-after from oldest entry in window
        const oldest = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
        const oldestTimestamp = oldest.length >= 2 ? Number(oldest[1]) : now;
        const retryAfterMs = Math.max(oldestTimestamp + windowMs - now, 1000);

        return {
          allowed: false,
          remaining: 0,
          limit,
          retryAfterMs,
        };
      }

      return {
        allowed: true,
        remaining: Math.max(limit - currentCount - 1, 0),
        limit,
        retryAfterMs: 0,
      };
    } catch (error) {
      // Fail open — never block legitimate users because Redis is down
      this.logger.error(
        { err: error, key },
        'Rate limit check failed, allowing request',
      );
      return { allowed: true, remaining: limit, limit, retryAfterMs: 0 };
    }
  }

  /**
   * Reset a specific rate limit key (e.g., after successful login clears
   * the failed-attempt counter).
   */
  async reset(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error({ err: error, key }, 'Failed to reset rate limit key');
    }
  }

  /**
   * Get the current count for a key without incrementing.
   */
  async peek(key: string, windowMs: number): Promise<number> {
    try {
      const windowStart = Date.now() - windowMs;
      await this.redis.zremrangebyscore(key, 0, windowStart);
      return await this.redis.zcard(key);
    } catch {
      return 0;
    }
  }
}
