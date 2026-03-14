import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { plans } from './plans.schema';

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'ACTIVE',
  'CANCELLED',
  'EXPIRED',
]);

export type SubscriptionStatus = (typeof subscriptionStatusEnum.enumValues)[number];

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
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
