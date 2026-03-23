import { Injectable, NestMiddleware, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { RateLimitService } from './rate-limit.service';
import { IP_RATE_LIMITS } from './rate-limit.config';

/**
 * Express middleware that enforces IP-level rate limiting BEFORE authentication.
 *
 * This is the first defense layer — catches bots, scanners, and brute force
 * before they reach the auth system.
 *
 * Uses a stricter limit for auth endpoints (/api/auth/*).
 */
@Injectable()
export class IpRateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IpRateLimitMiddleware.name);

  constructor(private readonly rateLimitService: RateLimitService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const ip = this.extractIp(req);
    const isAuthRoute = req.path.startsWith('/api/auth');

    const config = isAuthRoute ? IP_RATE_LIMITS.auth : IP_RATE_LIMITS.global;
    const key = `rl:ip:${ip}:${isAuthRoute ? 'auth' : 'global'}`;

    const result = await this.rateLimitService.check(
      key,
      config.limit,
      config.windowMs,
    );

    res.setHeader('X-RateLimit-Limit', result.limit.toString());
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString());

    if (!result.allowed) {
      this.logger.warn(
        {
          ip,
          path: req.path,
          method: req.method,
          userAgent: req.headers['user-agent'],
        },
        'IP rate limit exceeded',
      );

      res.setHeader(
        'Retry-After',
        Math.ceil(result.retryAfterMs / 1000).toString(),
      );

      res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests from this IP. Please try again later.',
        retryAfterMs: result.retryAfterMs,
      });
      return;
    }

    next();
  }

  private extractIp(req: Request): string {
    // Trust X-Forwarded-For from reverse proxy (Railway, Render, etc.)
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip ?? req.socket.remoteAddress ?? 'unknown';
  }
}
