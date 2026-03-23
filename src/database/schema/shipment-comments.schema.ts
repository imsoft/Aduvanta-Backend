import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { shipments } from './shipments.schema';

// Comments and notes on a shipment (internal communication)
export const shipmentComments = pgTable('shipment_comments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  shipmentId: text('shipment_id')
    .notNull()
    .references(() => shipments.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull(),
  authorName: text('author_name').notNull(),
  content: text('content').notNull(),
  // Whether this comment is visible to clients in the portal
  visibleToClient: text('visible_to_client').notNull().default('false'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
