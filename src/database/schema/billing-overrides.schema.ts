import { pgTable, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

// Grants a discount or free access to a specific organization.
// Created by super admins to onboard early users or run promotions.
export const billingOverrides = pgTable('billing_overrides', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull().unique(),
  // 0–99 = percentage discount; 100 = fully free
  discountPercent: integer('discount_percent').notNull().default(100),
  isFree: boolean('is_free').notNull().default(true),
  note: text('note'),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  createdById: text('created_by_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
