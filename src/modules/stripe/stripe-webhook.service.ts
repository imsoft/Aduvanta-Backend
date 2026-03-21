import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq, or } from 'drizzle-orm';
import type Stripe from 'stripe';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  plans,
  organizationSubscriptions,
  organizations,
} from '../../database/schema/index.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import { StripeService } from './stripe.service.js';

const SYSTEM_ACTOR_ID = 'system:stripe-webhook';

const GRACE_PERIOD_DAYS = 7;

type StripeStatusMap = Record<
  string,
  (typeof organizationSubscriptions.$inferSelect)['status']
>;

const STRIPE_STATUS_MAP: StripeStatusMap = {
  active: 'ACTIVE',
  trialing: 'TRIALING',
  past_due: 'PAST_DUE',
  canceled: 'CANCELLED',
  unpaid: 'EXPIRED',
};

function mapStripeStatus(
  stripeStatus: string,
): (typeof organizationSubscriptions.$inferSelect)['status'] {
  return STRIPE_STATUS_MAP[stripeStatus] ?? 'EXPIRED';
}

function resolveBillingInterval(
  priceInterval: string | null | undefined,
): string {
  if (priceInterval === 'year') {
    return 'year';
  }
  return 'month';
}

function extractSubscriptionIdFromInvoice(
  invoice: Stripe.Invoice,
): string | undefined {
  const subDetails = invoice.parent?.subscription_details;
  if (!subDetails) {
    return undefined;
  }
  return typeof subDetails.subscription === 'string'
    ? subDetails.subscription
    : subDetails.subscription?.id;
}

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly stripeService: StripeService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    try {
      const organizationId = session.metadata?.organizationId;

      if (!organizationId) {
        this.logger.error(
          { sessionId: session.id },
          'Checkout session missing organizationId in metadata',
        );
        return;
      }

      const stripeCustomerId =
        typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id;

      const stripeSubscriptionId =
        typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id;

      if (!stripeCustomerId || !stripeSubscriptionId) {
        this.logger.error(
          { sessionId: session.id, stripeCustomerId, stripeSubscriptionId },
          'Checkout session missing customer or subscription ID',
        );
        return;
      }

      // Update organization with Stripe customer ID if not already set
      const [org] = await this.db
        .select({ stripeCustomerId: organizations.stripeCustomerId })
        .from(organizations)
        .where(eq(organizations.id, organizationId))
        .limit(1);

      if (!org) {
        this.logger.error(
          { organizationId },
          'Organization not found for checkout session',
        );
        return;
      }

      if (!org.stripeCustomerId) {
        await this.db
          .update(organizations)
          .set({ stripeCustomerId })
          .where(eq(organizations.id, organizationId));
      }

      // Fetch subscription from Stripe to get plan details
      const stripeSubscription =
        await this.stripeService.getSubscription(stripeSubscriptionId);

      if (!stripeSubscription) {
        this.logger.error(
          { stripeSubscriptionId },
          'Failed to fetch Stripe subscription after checkout',
        );
        return;
      }

      const stripePriceId = stripeSubscription.items.data[0]?.price?.id;

      if (!stripePriceId) {
        this.logger.error(
          { stripeSubscriptionId },
          'Stripe subscription has no price ID',
        );
        return;
      }

      // Find plan by matching Stripe price ID (check both monthly and yearly)
      const [plan] = await this.db
        .select()
        .from(plans)
        .where(
          or(
            eq(plans.stripePriceIdMonthly, stripePriceId),
            eq(plans.stripePriceIdYearly, stripePriceId),
          ),
        )
        .limit(1);

      if (!plan) {
        this.logger.error(
          { stripePriceId },
          'No plan found matching Stripe price ID',
        );
        return;
      }

      const firstItem = stripeSubscription.items.data[0];

      const interval = resolveBillingInterval(
        firstItem?.price?.recurring?.interval,
      );

      // In Stripe API basil, current_period_end lives on the subscription item
      const currentPeriodEnd = firstItem?.current_period_end
        ? new Date(firstItem.current_period_end * 1000)
        : null;

      const trialEndsAt = stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null;

      // Upsert organization subscription
      const existing = await this.db
        .select({ id: organizationSubscriptions.id })
        .from(organizationSubscriptions)
        .where(eq(organizationSubscriptions.organizationId, organizationId))
        .limit(1);

      let subscriptionId: string;

      if (existing[0]) {
        const [updated] = await this.db
          .update(organizationSubscriptions)
          .set({
            planId: plan.id,
            stripeSubscriptionId,
            status: mapStripeStatus(stripeSubscription.status),
            billingInterval: interval,
            currentPeriodEnd,
            trialEndsAt,
            cancelAtPeriodEnd: false,
            gracePeriodEndsAt: null,
          })
          .where(eq(organizationSubscriptions.id, existing[0].id))
          .returning();
        subscriptionId = updated.id;
      } else {
        const [inserted] = await this.db
          .insert(organizationSubscriptions)
          .values({
            organizationId,
            planId: plan.id,
            stripeSubscriptionId,
            status: mapStripeStatus(stripeSubscription.status),
            billingInterval: interval,
            startedAt: new Date(),
            currentPeriodEnd,
            trialEndsAt,
          })
          .returning();
        subscriptionId = inserted.id;
      }

      await this.auditLogsService.log({
        organizationId,
        actorId: SYSTEM_ACTOR_ID,
        action: AUDIT_ACTION.SUBSCRIPTION_ASSIGNED,
        resource: 'subscription',
        resourceId: subscriptionId,
        metadata: {
          planId: plan.id,
          planCode: plan.code,
          stripeSubscriptionId,
          stripeCustomerId,
          billingInterval: interval,
        },
      });

      this.logger.log(
        { organizationId, planId: plan.id, stripeSubscriptionId },
        'Checkout completed — subscription created/activated',
      );
    } catch (error) {
      this.logger.error(
        { error, sessionId: session.id },
        'Failed to handle checkout.session.completed',
      );
    }
  }

  async handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    try {
      const stripeSubscriptionId = subscription.id;

      const [existing] = await this.db
        .select()
        .from(organizationSubscriptions)
        .where(
          eq(
            organizationSubscriptions.stripeSubscriptionId,
            stripeSubscriptionId,
          ),
        )
        .limit(1);

      if (!existing) {
        this.logger.warn(
          { stripeSubscriptionId },
          'Subscription updated event for unknown subscription — ignoring',
        );
        return;
      }

      const stripePriceId = subscription.items.data[0]?.price?.id;
      let planId = existing.planId;

      if (stripePriceId) {
        const [plan] = await this.db
          .select()
          .from(plans)
          .where(
            or(
              eq(plans.stripePriceIdMonthly, stripePriceId),
              eq(plans.stripePriceIdYearly, stripePriceId),
            ),
          )
          .limit(1);

        if (plan) {
          planId = plan.id;
        } else {
          this.logger.warn(
            { stripePriceId, stripeSubscriptionId },
            'No plan found for Stripe price ID during subscription update',
          );
        }
      }

      const firstItem = subscription.items.data[0];

      const interval = resolveBillingInterval(
        firstItem?.price?.recurring?.interval,
      );

      // In Stripe API basil, current_period_end lives on the subscription item
      const currentPeriodEnd = firstItem?.current_period_end
        ? new Date(firstItem.current_period_end * 1000)
        : null;

      const status = mapStripeStatus(subscription.status);

      await this.db
        .update(organizationSubscriptions)
        .set({
          planId,
          status,
          currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          billingInterval: interval,
        })
        .where(eq(organizationSubscriptions.id, existing.id));

      await this.auditLogsService.log({
        organizationId: existing.organizationId,
        actorId: SYSTEM_ACTOR_ID,
        action: AUDIT_ACTION.SUBSCRIPTION_UPDATED,
        resource: 'subscription',
        resourceId: existing.id,
        metadata: {
          stripeSubscriptionId,
          previousStatus: existing.status,
          newStatus: status,
          planId,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          billingInterval: interval,
        },
      });

      this.logger.log(
        { stripeSubscriptionId, status, planId },
        'Subscription updated',
      );
    } catch (error) {
      this.logger.error(
        { error, subscriptionId: subscription.id },
        'Failed to handle customer.subscription.updated',
      );
    }
  }

  async handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    try {
      const stripeSubscriptionId = subscription.id;

      const [existing] = await this.db
        .select()
        .from(organizationSubscriptions)
        .where(
          eq(
            organizationSubscriptions.stripeSubscriptionId,
            stripeSubscriptionId,
          ),
        )
        .limit(1);

      if (!existing) {
        this.logger.warn(
          { stripeSubscriptionId },
          'Subscription deleted event for unknown subscription — ignoring',
        );
        return;
      }

      await this.db
        .update(organizationSubscriptions)
        .set({
          status: 'CANCELLED',
          endsAt: new Date(),
          cancelAtPeriodEnd: false,
        })
        .where(eq(organizationSubscriptions.id, existing.id));

      await this.auditLogsService.log({
        organizationId: existing.organizationId,
        actorId: SYSTEM_ACTOR_ID,
        action: AUDIT_ACTION.SUBSCRIPTION_UPDATED,
        resource: 'subscription',
        resourceId: existing.id,
        metadata: {
          stripeSubscriptionId,
          previousStatus: existing.status,
          newStatus: 'CANCELLED',
          reason: 'stripe_subscription_deleted',
        },
      });

      this.logger.log(
        { stripeSubscriptionId, organizationId: existing.organizationId },
        'Subscription cancelled (deleted by Stripe)',
      );
    } catch (error) {
      this.logger.error(
        { error, subscriptionId: subscription.id },
        'Failed to handle customer.subscription.deleted',
      );
    }
  }

  async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    try {
      const stripeSubscriptionId = extractSubscriptionIdFromInvoice(invoice);

      if (!stripeSubscriptionId) {
        this.logger.log(
          { invoiceId: invoice.id },
          'Invoice paid without subscription — ignoring (one-time payment)',
        );
        return;
      }

      const [existing] = await this.db
        .select()
        .from(organizationSubscriptions)
        .where(
          eq(
            organizationSubscriptions.stripeSubscriptionId,
            stripeSubscriptionId,
          ),
        )
        .limit(1);

      if (!existing) {
        this.logger.warn(
          { stripeSubscriptionId, invoiceId: invoice.id },
          'Invoice paid for unknown subscription — ignoring',
        );
        return;
      }

      if (existing.status === 'PAST_DUE') {
        await this.db
          .update(organizationSubscriptions)
          .set({
            status: 'ACTIVE',
            gracePeriodEndsAt: null,
          })
          .where(eq(organizationSubscriptions.id, existing.id));

        this.logger.log(
          { stripeSubscriptionId, organizationId: existing.organizationId },
          'Subscription restored to ACTIVE after successful payment',
        );
      }

      await this.auditLogsService.log({
        organizationId: existing.organizationId,
        actorId: SYSTEM_ACTOR_ID,
        action: AUDIT_ACTION.PAYMENT_CONFIRMED,
        resource: 'subscription',
        resourceId: existing.id,
        metadata: {
          stripeSubscriptionId,
          invoiceId: invoice.id,
          amountPaid: invoice.amount_paid,
          currency: invoice.currency,
          previousStatus: existing.status,
        },
      });
    } catch (error) {
      this.logger.error(
        { error, invoiceId: invoice.id },
        'Failed to handle invoice.paid',
      );
    }
  }

  async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    try {
      const stripeSubscriptionId = extractSubscriptionIdFromInvoice(invoice);

      if (!stripeSubscriptionId) {
        this.logger.log(
          { invoiceId: invoice.id },
          'Payment failed for invoice without subscription — ignoring',
        );
        return;
      }

      const [existing] = await this.db
        .select()
        .from(organizationSubscriptions)
        .where(
          eq(
            organizationSubscriptions.stripeSubscriptionId,
            stripeSubscriptionId,
          ),
        )
        .limit(1);

      if (!existing) {
        this.logger.warn(
          { stripeSubscriptionId, invoiceId: invoice.id },
          'Payment failed for unknown subscription — ignoring',
        );
        return;
      }

      const gracePeriodEndsAt = new Date();
      gracePeriodEndsAt.setDate(
        gracePeriodEndsAt.getDate() + GRACE_PERIOD_DAYS,
      );

      await this.db
        .update(organizationSubscriptions)
        .set({
          status: 'PAST_DUE',
          gracePeriodEndsAt,
        })
        .where(eq(organizationSubscriptions.id, existing.id));

      await this.auditLogsService.log({
        organizationId: existing.organizationId,
        actorId: SYSTEM_ACTOR_ID,
        action: AUDIT_ACTION.PAYMENT_CANCELLED,
        resource: 'subscription',
        resourceId: existing.id,
        metadata: {
          stripeSubscriptionId,
          invoiceId: invoice.id,
          amountDue: invoice.amount_due,
          currency: invoice.currency,
          previousStatus: existing.status,
          gracePeriodEndsAt: gracePeriodEndsAt.toISOString(),
          reason: 'payment_failed',
        },
      });

      this.logger.warn(
        {
          stripeSubscriptionId,
          organizationId: existing.organizationId,
          gracePeriodEndsAt,
        },
        'Payment failed — subscription marked as PAST_DUE with grace period',
      );
    } catch (error) {
      this.logger.error(
        { error, invoiceId: invoice.id },
        'Failed to handle invoice.payment_failed',
      );
    }
  }
}
