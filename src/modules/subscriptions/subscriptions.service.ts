import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { organizations } from '../../database/schema/index.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import { StripeService } from '../stripe/stripe.service.js';
import { AppConfigService } from '../../config/config.service.js';
import {
  SubscriptionsRepository,
  type SubscriptionWithPlan,
  type PlanRecord,
} from './subscriptions.repository.js';
import type { AssignSubscriptionDto } from './dto/assign-subscription.dto.js';
import type { CreateCheckoutDto } from './dto/create-checkout.dto.js';
import type { ChangePlanDto } from './dto/change-plan.dto.js';

@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly auditLogsService: AuditLogsService,
    private readonly stripeService: StripeService,
    private readonly config: AppConfigService,
  ) {}

  async listPlans(): Promise<PlanRecord[]> {
    return this.subscriptionsRepository.findAllPlans();
  }

  async getSubscription(
    organizationId: string,
  ): Promise<SubscriptionWithPlan | null> {
    const result =
      await this.subscriptionsRepository.findSubscriptionByOrg(organizationId);
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

    const existing =
      await this.subscriptionsRepository.findSubscriptionByOrg(organizationId);

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

  // --- Stripe-powered methods ---

  async createCheckoutSession(
    organizationId: string,
    dto: CreateCheckoutDto,
    actorId: string,
    actorEmail: string,
    orgName: string,
  ): Promise<{ url: string }> {
    const plan = await this.subscriptionsRepository.findPlanById(dto.planId);

    if (!plan) {
      throw new NotFoundException(`Plan ${dto.planId} not found`);
    }

    if (plan.status !== 'ACTIVE') {
      throw new BadRequestException(
        `Plan "${plan.name}" is not available for subscription`,
      );
    }

    const priceId =
      dto.billingInterval === 'year'
        ? plan.stripePriceIdYearly
        : plan.stripePriceIdMonthly;

    if (!priceId) {
      throw new BadRequestException(
        `Plan "${plan.name}" has no Stripe price configured for ${dto.billingInterval} billing`,
      );
    }

    // Get or create Stripe customer for this organization.
    const stripeCustomerId = await this.ensureStripeCustomer(
      organizationId,
      actorEmail,
      orgName,
    );

    const frontendUrl = this.config.get('FRONTEND_URL');

    const session = await this.stripeService.createCheckoutSession({
      customerId: stripeCustomerId,
      priceId,
      organizationId,
      successUrl: `${frontendUrl}/settings/billing?checkout=success`,
      cancelUrl: `${frontendUrl}/settings/billing?checkout=cancelled`,
      trialDays: plan.trialDays,
    });

    if (!session.url) {
      throw new BadRequestException('Stripe did not return a checkout URL');
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.SUBSCRIPTION_UPDATED,
      resource: 'subscription',
      resourceId: organizationId,
      metadata: {
        event: 'checkout_session_created',
        planId: plan.id,
        planCode: plan.code,
        billingInterval: dto.billingInterval,
        stripeSessionId: session.id,
      },
    });

    return { url: session.url };
  }

  async createPortalSession(organizationId: string): Promise<{ url: string }> {
    const [org] = await this.db
      .select({ stripeCustomerId: organizations.stripeCustomerId })
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!org?.stripeCustomerId) {
      throw new BadRequestException(
        'Organization does not have a Stripe customer. Subscribe to a plan first.',
      );
    }

    const frontendUrl = this.config.get('FRONTEND_URL');

    const portalSession = await this.stripeService.createPortalSession({
      customerId: org.stripeCustomerId,
      returnUrl: `${frontendUrl}/settings/billing`,
    });

    return { url: portalSession.url };
  }

  async changePlan(
    organizationId: string,
    dto: ChangePlanDto,
    actorId: string,
  ): Promise<{ message: string }> {
    const existing =
      await this.subscriptionsRepository.findSubscriptionByOrg(organizationId);

    if (!existing) {
      throw new BadRequestException(
        'No active subscription found. Please subscribe first.',
      );
    }

    if (!existing.subscription.stripeSubscriptionId) {
      throw new BadRequestException(
        'Subscription is not managed by Stripe. Use the admin assign endpoint.',
      );
    }

    const plan = await this.subscriptionsRepository.findPlanById(dto.planId);

    if (!plan) {
      throw new NotFoundException(`Plan ${dto.planId} not found`);
    }

    const priceId =
      dto.billingInterval === 'year'
        ? plan.stripePriceIdYearly
        : plan.stripePriceIdMonthly;

    if (!priceId) {
      throw new BadRequestException(
        `Plan "${plan.name}" has no Stripe price for ${dto.billingInterval} billing`,
      );
    }

    await this.stripeService.updateSubscription(
      existing.subscription.stripeSubscriptionId,
      { priceId, prorationBehavior: 'always_invoice' },
    );

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.SUBSCRIPTION_UPDATED,
      resource: 'subscription',
      resourceId: existing.subscription.id,
      metadata: {
        event: 'plan_change_requested',
        previousPlanId: existing.subscription.planId,
        newPlanId: plan.id,
        newPlanCode: plan.code,
        billingInterval: dto.billingInterval,
      },
    });

    return {
      message:
        'Plan change processed. Subscription will update shortly via webhook.',
    };
  }

  async cancelSubscription(
    organizationId: string,
    actorId: string,
  ): Promise<{ message: string }> {
    const existing =
      await this.subscriptionsRepository.findSubscriptionByOrg(organizationId);

    if (!existing) {
      throw new BadRequestException('No active subscription found.');
    }

    if (!existing.subscription.stripeSubscriptionId) {
      throw new BadRequestException('Subscription is not managed by Stripe.');
    }

    await this.stripeService.cancelSubscription(
      existing.subscription.stripeSubscriptionId,
      { immediately: false },
    );

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.SUBSCRIPTION_UPDATED,
      resource: 'subscription',
      resourceId: existing.subscription.id,
      metadata: {
        event: 'cancellation_requested',
        cancelAtPeriodEnd: true,
      },
    });

    return {
      message: 'Subscription will cancel at end of current billing period.',
    };
  }

  async resumeSubscription(
    organizationId: string,
    actorId: string,
  ): Promise<{ message: string }> {
    const existing =
      await this.subscriptionsRepository.findSubscriptionByOrg(organizationId);

    if (!existing) {
      throw new BadRequestException('No active subscription found.');
    }

    if (!existing.subscription.stripeSubscriptionId) {
      throw new BadRequestException('Subscription is not managed by Stripe.');
    }

    if (!existing.subscription.cancelAtPeriodEnd) {
      throw new BadRequestException(
        'Subscription is not scheduled for cancellation.',
      );
    }

    await this.stripeService.resumeSubscription(
      existing.subscription.stripeSubscriptionId,
    );

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.SUBSCRIPTION_UPDATED,
      resource: 'subscription',
      resourceId: existing.subscription.id,
      metadata: {
        event: 'cancellation_reversed',
      },
    });

    return {
      message: 'Subscription cancellation reversed. Billing will continue.',
    };
  }

  // --- Private helpers ---

  private async ensureStripeCustomer(
    organizationId: string,
    email: string,
    orgName: string,
  ): Promise<string> {
    const [org] = await this.db
      .select({
        stripeCustomerId: organizations.stripeCustomerId,
      })
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (org?.stripeCustomerId) {
      return org.stripeCustomerId;
    }

    const customer = await this.stripeService.createCustomer({
      email,
      name: orgName,
      metadata: { organizationId },
    });

    await this.db
      .update(organizations)
      .set({ stripeCustomerId: customer.id })
      .where(eq(organizations.id, organizationId));

    return customer.id;
  }
}
