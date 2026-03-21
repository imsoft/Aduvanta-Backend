import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const organizations = pgTable('organizations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  // References Better Auth's user table — no FK constraint to avoid
  // drizzle-kit migration conflicts with Better Auth-managed tables.
  createdById: text('created_by_id').notNull(),
  // Stripe customer ID — created when org first enters checkout flow.
  stripeCustomerId: text('stripe_customer_id').unique(),
});
