import { numeric, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { operations } from './operations.schema';

export const operationAdvanceStatusEnum = pgEnum('operation_advance_status', [
  'ACTIVE',
  'INACTIVE',
]);

export type OperationAdvanceStatus =
  (typeof operationAdvanceStatusEnum.enumValues)[number];

export const operationAdvances = pgTable('operation_advances', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  operationId: text('operation_id')
    .notNull()
    .references(() => operations.id, { onDelete: 'restrict' }),
  // Stored as numeric string to avoid floating-point precision issues.
  amount: numeric('amount', { precision: 18, scale: 4 }).notNull(),
  currency: text('currency').notNull(),
  reference: text('reference'),
  notes: text('notes'),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull(),
  status: operationAdvanceStatusEnum('status').notNull().default('ACTIVE'),
  // References Better Auth user — no FK to avoid drizzle-kit migration conflicts.
  createdById: text('created_by_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
