import { boolean, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { plans } from './plans.schema';

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'ACTIVE',
  'TRIALING',
  'PAST_DUE',
  'CANCELLED',
  'EXPIRED',
]);

export type SubscriptionStatus =
  (typeof subscriptionStatusEnum.enumValues)[number];

export const organizationSubscriptions = pgTable('organization_subscriptions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  // One active subscription per organization.
  organizationId: text('organization_id')
    .notNull()
    .unique()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  planId: text('plan_id')
    .notNull()
    .references(() => plans.id),
  status: subscriptionStatusEnum('status').notNull().default('ACTIVE'),
  // Stripe subscription ID — source of truth for billing state
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  // Billing interval: 'month' or 'year'
  billingInterval: text('billing_interval').default('month'),
  startedAt: timestamp('started_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  // Current billing period end — from Stripe
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  // Whether sub cancels at period end (downgrade/cancel scheduled)
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  // Trial end date
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  // Grace period: when past_due, how long before we restrict access
  gracePeriodEndsAt: timestamp('grace_period_ends_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
