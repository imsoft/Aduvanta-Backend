import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { SubscriptionsRepository } from '../../modules/subscriptions/subscriptions.repository.js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Guard that checks whether the organization has a valid subscription.
 *
 * Use on read-only endpoints where you want to ensure the org has not
 * been fully suspended but do not need to check usage limits.
 *
 * Fail-open: if no subscription is found the request is allowed
 * (some orgs may be grandfathered or not yet assigned a plan).
 */
@Injectable()
export class SubscriptionStatusGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionStatusGuard.name);

  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const organizationId = this.extractOrganizationId(request);

    if (!organizationId) {
      this.logger.warn(
        'SubscriptionStatusGuard: no organizationId found, allowing request (fail open)',
      );
      return true;
    }

    const record =
      await this.subscriptionsRepository.findSubscriptionByOrg(organizationId);

    if (!record) {
      this.logger.warn(
        { organizationId },
        'SubscriptionStatusGuard: no subscription found, allowing request (fail open)',
      );
      return true;
    }

    const { subscription } = record;
    const status = subscription.status;

    if (status === 'ACTIVE' || status === 'TRIALING') {
      return true;
    }

    if (status === 'PAST_DUE') {
      if (
        subscription.gracePeriodEndsAt &&
        new Date() < subscription.gracePeriodEndsAt
      ) {
        return true;
      }

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

    // CANCELLED or EXPIRED
    throw new HttpException(
      {
        statusCode: HttpStatus.FORBIDDEN,
        error: 'SubscriptionInactive',
        message: `Your subscription is ${status.toLowerCase()}. Please renew to continue.`,
      },
      HttpStatus.FORBIDDEN,
    );
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
