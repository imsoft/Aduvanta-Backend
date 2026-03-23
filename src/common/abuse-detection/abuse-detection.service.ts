import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS } from '../../redis/redis.module';

type AbuseEvent = {
  userId?: string;
  ip: string;
  organizationId?: string;
  action: string;
  path: string;
  method: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
};

type ThreatLevel = 'low' | 'medium' | 'high' | 'critical';

type AbuseScore = {
  score: number;
  level: ThreatLevel;
  blocked: boolean;
  reasons: string[];
};

const SCORE_THRESHOLDS = {
  low: 0,
  medium: 30,
  high: 60,
  critical: 80,
} as const;

const BLOCK_THRESHOLD = 80;

/**
 * Behavioral abuse detection service.
 *
 * Tracks patterns that indicate abuse and computes a risk score per IP/user.
 * Scores decay over time (TTL on Redis keys).
 *
 * Signals tracked:
 * - rate_limit_hit: user/IP hit a rate limit
 * - auth_failure: failed login attempt
 * - validation_error: sent malformed requests
 * - forbidden: tried to access resources without permission
 * - suspicious_ua: known bot/scanner user agent
 * - rapid_fire: many requests in very short window
 */
@Injectable()
export class AbuseDetectionService {
  private readonly logger = new Logger(AbuseDetectionService.name);

  private readonly SCORE_WEIGHTS: Record<string, number> = {
    rate_limit_hit: 10,
    auth_failure: 15,
    validation_error: 5,
    forbidden: 20,
    suspicious_ua: 25,
    rapid_fire: 30,
    account_lockout: 40,
  };

  private readonly DECAY_WINDOW_MS = 3_600_000; // 1 hour

  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  /**
   * Record an abuse signal and update the risk score.
   */
  async recordSignal(event: AbuseEvent): Promise<AbuseScore> {
    const identifier = event.userId ?? event.ip;
    const key = `abuse:${identifier}`;
    const signalKey = `abuse:signals:${identifier}`;
    const now = Date.now();
    const weight = this.SCORE_WEIGHTS[event.action] ?? 5;

    try {
      const pipeline = this.redis.pipeline();

      // Add weighted signal to sorted set
      pipeline.zadd(signalKey, now, `${event.action}:${now}:${weight}`);
      pipeline.pexpire(signalKey, this.DECAY_WINDOW_MS);

      // Prune old signals
      pipeline.zremrangebyscore(signalKey, 0, now - this.DECAY_WINDOW_MS);

      await pipeline.exec();

      // Calculate current score
      const score = await this.calculateScore(signalKey);
      const level = this.scoreToLevel(score);
      const blocked = score >= BLOCK_THRESHOLD;

      // If blocked, set a block flag with TTL
      if (blocked) {
        await this.redis.set(
          `abuse:blocked:${identifier}`,
          'true',
          'EX',
          900, // 15 minute block
        );

        this.logger.error(
          {
            identifier,
            score,
            action: event.action,
            ip: event.ip,
            path: event.path,
          },
          'User/IP blocked due to abuse score',
        );
      } else if (level === 'high') {
        this.logger.warn(
          {
            identifier,
            score,
            action: event.action,
            ip: event.ip,
          },
          'High abuse score detected',
        );
      }

      // Store structured log for monitoring
      await this.logAbuseEvent(event, score, level);

      return {
        score,
        level,
        blocked,
        reasons: await this.getRecentReasons(signalKey),
      };
    } catch (error) {
      this.logger.error(
        { err: error, identifier },
        'Failed to record abuse signal',
      );
      return { score: 0, level: 'low', blocked: false, reasons: [] };
    }
  }

  /**
   * Check if an IP or user is currently blocked.
   */
  async isBlocked(identifier: string): Promise<boolean> {
    try {
      const result = await this.redis.get(`abuse:blocked:${identifier}`);
      return result === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Get the current abuse score for an identifier.
   */
  async getScore(identifier: string): Promise<AbuseScore> {
    const signalKey = `abuse:signals:${identifier}`;
    try {
      const score = await this.calculateScore(signalKey);
      return {
        score,
        level: this.scoreToLevel(score),
        blocked: await this.isBlocked(identifier),
        reasons: await this.getRecentReasons(signalKey),
      };
    } catch {
      return { score: 0, level: 'low', blocked: false, reasons: [] };
    }
  }

  /**
   * Manually unblock an identifier (admin action).
   */
  async unblock(identifier: string): Promise<void> {
    try {
      await this.redis.del(
        `abuse:blocked:${identifier}`,
        `abuse:signals:${identifier}`,
      );
      this.logger.log(`Abuse block manually cleared: ${identifier}`);
    } catch (error) {
      this.logger.error({ err: error, identifier }, 'Failed to unblock');
    }
  }

  private async calculateScore(signalKey: string): Promise<number> {
    const signals = await this.redis.zrange(signalKey, 0, -1);
    let total = 0;
    for (const signal of signals) {
      const parts = signal.split(':');
      const weight = Number(parts[parts.length - 1]);
      if (!Number.isNaN(weight)) {
        total += weight;
      }
    }
    // Cap at 100
    return Math.min(total, 100);
  }

  private scoreToLevel(score: number): ThreatLevel {
    if (score >= SCORE_THRESHOLDS.critical) return 'critical';
    if (score >= SCORE_THRESHOLDS.high) return 'high';
    if (score >= SCORE_THRESHOLDS.medium) return 'medium';
    return 'low';
  }

  private async getRecentReasons(signalKey: string): Promise<string[]> {
    const signals = await this.redis.zrange(signalKey, -5, -1);
    return signals.map((s) => s.split(':')[0]);
  }

  private async logAbuseEvent(
    event: AbuseEvent,
    score: number,
    level: ThreatLevel,
  ): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...event,
      score,
      level,
    };

    // Store in a Redis list for real-time monitoring (capped at 10000 entries)
    try {
      const key = 'abuse:log';
      await this.redis.lpush(key, JSON.stringify(logEntry));
      await this.redis.ltrim(key, 0, 9999);
    } catch {
      // Non-critical — structured logging via Pino already captures this
    }
  }
}
