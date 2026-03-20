import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { customsEntries, entryStatusEnum } from './customs-entries.schema.js';

// Status change history for customs entries
export const customsEntryStatusHistory = pgTable(
  'customs_entry_status_history',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    entryId: text('entry_id')
      .notNull()
      .references(() => customsEntries.id, { onDelete: 'cascade' }),
    previousStatus: entryStatusEnum('previous_status'),
    newStatus: entryStatusEnum('new_status').notNull(),
    changedById: text('changed_by_id').notNull(),
    reason: text('reason'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);
