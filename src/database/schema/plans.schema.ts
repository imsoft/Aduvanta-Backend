import { integer, numeric, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const planStatusEnum = pgEnum('plan_status', ['ACTIVE', 'DEPRECATED']);

export type PlanStatus = (typeof planStatusEnum.enumValues)[number];

export const plans = pgTable('plans', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  status: planStatusEnum('status').notNull().default('ACTIVE'),
  // Limits — integer is sufficient for practical values (max 2.1B)
  maxUsers: integer('max_users').notNull().default(5),
  maxClients: integer('max_clients').notNull().default(100),
  maxOperations: integer('max_operations').notNull().default(500),
  maxStorageBytes: integer('max_storage_bytes')
    .notNull()
    .default(1_073_741_824), // 1 GB
  maxIntegrations: integer('max_integrations').notNull().default(3),
  // Stripe price IDs for this plan
  stripePriceIdMonthly: text('stripe_price_id_monthly'),
  stripePriceIdYearly: text('stripe_price_id_yearly'),
  // Display prices (stored in MXN centavos for precision)
  priceMonthly: numeric('price_monthly', { precision: 10, scale: 2 }),
  priceYearly: numeric('price_yearly', { precision: 10, scale: 2 }),
  // Trial days for new subscriptions on this plan
  trialDays: integer('trial_days').notNull().default(14),
  // Sort order for display
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
