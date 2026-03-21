import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { SubscriptionsRepository } from '../../modules/subscriptions/subscriptions.repository.js';
import { UsageService } from '../../modules/usage/usage.service.js';
import {
  PLAN_LIMIT_KEY,
  type PlanLimitResource,
} from '../decorators/plan-limit.decorator.js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const RESOURCE_TO_LIMIT_KEY: Record<PlanLimitResource, string> = {
  users: 'maxUsers',
  clients: 'maxClients',
  operations: 'maxOperations',
  integrations: 'maxIntegrations',
};

/**
 * Guard that enforces subscription status AND plan usage limits.
 *
 * Designed to run after AuthGuard and PermissionsGuard so that
 * session and organization context are already available.
 *
 * Behaviour:
 * - ACTIVE / TRIALING: allowed, then check usage limits if @PlanLimit is set
 * - PAST_DUE within grace period: allowed, then check usage limits
 * - PAST_DUE past grace period: denied
 * - CANCELLED / EXPIRED: denied
 * - No subscription found: allowed (fail open)
 * - Errors during check: allowed (fail open) with warning log
 */
@Injectable()
export class PlanEnforcementGuard implements CanActivate {
  private readonly logger = new Logger(PlanEnforcementGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly usageService: UsageService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const organizationId = this.extractOrganizationId(request);

    if (!organizationId) {
      this.logger.warn(
        'PlanEnforcementGuard: no organizationId found, allowing request (fail open)',
      );
      return true;
    }

    let subscriptionResult: Awaited<
      ReturnType<SubscriptionsRepository['findSubscriptionByOrg']>
    >;
    try {
      subscriptionResult =
        await this.subscriptionsRepository.findSubscriptionByOrg(
          organizationId,
        );
    } catch (error) {
      this.logger.warn(
        { organizationId, error },
        'PlanEnforcementGuard: failed to query subscription, allowing request (fail open)',
      );
      return true;
    }

    if (!subscriptionResult) {
      this.logger.warn(
        { organizationId },
        'PlanEnforcementGuard: no subscription found, allowing request (fail open)',
      );
      return true;
    }

    const { subscription } = subscriptionResult;
    const status = subscription.status;

    // Deny hard-blocked statuses first
    if (status === 'CANCELLED' || status === 'EXPIRED') {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          error: 'SubscriptionInactive',
          message: `Your subscription is ${status.toLowerCase()}. Please renew to continue.`,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (status === 'PAST_DUE') {
      if (
        !subscription.gracePeriodEndsAt ||
        new Date() >= subscription.gracePeriodEndsAt
      ) {
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            error: 'SubscriptionPastDue',
            message:
              'Your subscription is past due and the grace period has expired. Please update your payment method.',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      // Within grace period — fall through to usage check
    }

    // Subscription is ACTIVE, TRIALING, or PAST_DUE within grace.
    // Now check usage limits if @PlanLimit decorator is present.
    const resource = this.reflector.getAllAndOverride<
      PlanLimitResource | undefined
    >(PLAN_LIMIT_KEY, [context.getHandler(), context.getClass()]);

    if (!resource) {
      return true;
    }

    try {
      const usage = await this.usageService.getUsage(organizationId);

      if (!usage.limits) {
        this.logger.warn(
          { organizationId, resource },
          'PlanEnforcementGuard: no plan limits available, allowing request (fail open)',
        );
        return true;
      }

      const limitKey = RESOURCE_TO_LIMIT_KEY[resource];
      const currentCount = usage.metrics[resource];
      const limit = usage.limits[limitKey as keyof typeof usage.limits];

      if (currentCount >= limit) {
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            error: 'PlanLimitReached',
            message: `Plan limit reached for ${resource}. Current: ${currentCount}, Limit: ${limit}. Please upgrade.`,
            resource,
            current: currentCount,
            limit,
            planCode: usage.planCode,
          },
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error) {
      // Re-throw our own HttpException
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.warn(
        { organizationId, resource, error },
        'PlanEnforcementGuard: failed to check usage limits, allowing request (fail open)',
      );
    }

    return true;
  }

  private extractOrganizationId(request: Request): string | undefined {
    const fromParam = (request.params as Record<string, string>)[
      'organizationId'
    ];
    if (fromParam && UUID_RE.test(fromParam)) {
      return fromParam;
    }

    const fromHeader = request.headers['x-organization-id'];
    if (typeof fromHeader === 'string' && UUID_RE.test(fromHeader)) {
      return fromHeader;
    }

    return undefined;
  }
}
