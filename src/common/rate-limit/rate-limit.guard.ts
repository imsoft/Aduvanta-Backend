import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitService } from './rate-limit.service';
import { RATE_LIMIT_CATEGORY_KEY } from './rate-limit.decorator';
import { RATE_LIMITS, TENANT_RATE_LIMITS } from './rate-limit.config';
import type { Request, Response } from 'express';

type ActiveSession = {
  session: { userId: string };
  user: { id: string };
};

/**
 * Post-authentication rate limit guard.
 *
 * Applies per-user AND per-tenant sliding window limits.
 * Plan-aware: different limits for free vs enterprise.
 *
 * This guard runs AFTER AuthGuard, so it has access to the session.
 * For unauthenticated endpoints, use the IP-level middleware instead.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const category =
      this.reflector.getAllAndOverride<string>(RATE_LIMIT_CATEGORY_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'global';

    const session = (request as Request & { activeSession?: ActiveSession })
      .activeSession;
    if (!session) {
      // No session — IP-level middleware handles this
      return true;
    }

    const userId = session.session.userId;
    const organizationId =
      (request.headers['x-organization-id'] as string) ?? 'no-org';

    // Determine plan — default to 'free' if not available
    const plan = this.resolvePlan(request);

    const categoryConfig = RATE_LIMITS[category] ?? RATE_LIMITS['global'];
    const planConfig = categoryConfig[plan] ?? categoryConfig['default'];

    // --- Per-user check ---
    const userKey = `rl:user:${userId}:${category}`;
    const userResult = await this.rateLimitService.check(
      userKey,
      planConfig.limit,
      planConfig.windowMs,
    );

    this.setRateLimitHeaders(response, userResult.limit, userResult.remaining);

    if (!userResult.allowed) {
      this.logger.warn(
        {
          userId,
          organizationId,
          category,
          plan,
          ip: request.ip,
        },
        'User rate limit exceeded',
      );

      response.setHeader(
        'Retry-After',
        Math.ceil(userResult.retryAfterMs / 1000).toString(),
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
          retryAfterMs: userResult.retryAfterMs,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // --- Per-tenant check (aggregate across all users in org) ---
    if (organizationId !== 'no-org') {
      const tenantConfig =
        TENANT_RATE_LIMITS[plan] ?? TENANT_RATE_LIMITS['default'];
      const tenantKey = `rl:tenant:${organizationId}`;
      const tenantResult = await this.rateLimitService.check(
        tenantKey,
        tenantConfig.limit,
        tenantConfig.windowMs,
      );

      if (!tenantResult.allowed) {
        this.logger.warn(
          {
            organizationId,
            category,
            plan,
            ip: request.ip,
          },
          'Tenant rate limit exceeded',
        );

        response.setHeader(
          'Retry-After',
          Math.ceil(tenantResult.retryAfterMs / 1000).toString(),
        );

        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message:
              'Your organization has exceeded its request limit. Please try again later.',
            retryAfterMs: tenantResult.retryAfterMs,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    return true;
  }

  private resolvePlan(request: Request): string {
    // Plan is attached by a prior middleware or from the session context.
    // For now, read from a header or default. In production, this comes
    // from the subscription module.
    const planHeader = (request as Request & { subscriptionPlan?: string })
      .subscriptionPlan;
    return planHeader ?? 'free';
  }

  private setRateLimitHeaders(
    response: Response,
    limit: number,
    remaining: number,
  ): void {
    response.setHeader('X-RateLimit-Limit', limit.toString());
    response.setHeader('X-RateLimit-Remaining', remaining.toString());
  }
}
