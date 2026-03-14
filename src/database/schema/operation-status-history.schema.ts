import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { operations } from './operations.schema';
import type { OperationStatus } from './operations.schema';

export const operationStatusHistory = pgTable('operation_status_history', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull(),
  operationId: text('operation_id')
    .notNull()
    .references(() => operations.id, { onDelete: 'cascade' }),
  fromStatus: text('from_status').$type<OperationStatus>(),
  toStatus: text('to_status').$type<OperationStatus>().notNull(),
  // References Better Auth user — no FK to avoid drizzle-kit migration conflicts.
  changedById: text('changed_by_id').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
