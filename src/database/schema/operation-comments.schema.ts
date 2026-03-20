import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { operations } from './operations.schema';

export const operationComments = pgTable('operation_comments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull(),
  operationId: text('operation_id')
    .notNull()
    .references(() => operations.id, { onDelete: 'cascade' }),
  // References Better Auth user — no FK to avoid drizzle-kit migration conflicts.
  authorId: text('author_id').notNull(),
  body: text('body').notNull(),
  isClientVisible: boolean('is_client_visible').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
