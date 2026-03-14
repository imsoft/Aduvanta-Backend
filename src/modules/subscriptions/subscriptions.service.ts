import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  SubscriptionsRepository,
  type SubscriptionWithPlan,
  type PlanRecord,
} from './subscriptions.repository.js';
import type { AssignSubscriptionDto } from './dto/assign-subscription.dto.js';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async listPlans(): Promise<PlanRecord[]> {
    return this.subscriptionsRepository.findAllPlans();
  }

  async getSubscription(
    organizationId: string,
  ): Promise<SubscriptionWithPlan | null> {
    const result = await this.subscriptionsRepository.findSubscriptionByOrg(
      organizationId,
    );
    return result ?? null;
  }

  async assignPlan(
    organizationId: string,
    dto: AssignSubscriptionDto,
    actorId: string,
  ): Promise<SubscriptionWithPlan> {
    const plan = await this.subscriptionsRepository.findPlanById(dto.planId);

    if (!plan) {
      throw new NotFoundException(`Plan ${dto.planId} not found`);
    }

    if (plan.status !== 'ACTIVE') {
      throw new BadRequestException(
        `Plan "${plan.name}" is not available for assignment`,
      );
    }

    const existing = await this.subscriptionsRepository.findSubscriptionByOrg(
      organizationId,
    );

    let subscription: SubscriptionWithPlan;

    if (existing) {
      const updated = await this.subscriptionsRepository.updateSubscription(
        existing.subscription.id,
        { planId: plan.id },
      );

      if (!updated) {
        throw new NotFoundException('Subscription update failed unexpectedly');
      }

      subscription = { subscription: updated, plan };

      await this.auditLogsService.log({
        organizationId,
        actorId,
        action: AUDIT_ACTION.SUBSCRIPTION_UPDATED,
        resource: 'subscription',
        resourceId: existing.subscription.id,
        metadata: {
          previousPlanId: existing.subscription.planId,
          newPlanId: plan.id,
          newPlanCode: plan.code,
        },
      });
    } else {
      const inserted = await this.subscriptionsRepository.insertSubscription({
        organizationId,
        planId: plan.id,
        status: 'ACTIVE',
        startedAt: new Date(),
      });

      subscription = { subscription: inserted, plan };

      await this.auditLogsService.log({
        organizationId,
        actorId,
        action: AUDIT_ACTION.SUBSCRIPTION_ASSIGNED,
        resource: 'subscription',
        resourceId: inserted.id,
        metadata: { planId: plan.id, planCode: plan.code },
      });
    }

    return subscription;
  }
}
