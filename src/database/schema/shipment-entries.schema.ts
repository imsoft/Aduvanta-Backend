import { pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { shipments } from './shipments.schema';
import { customsEntries } from './customs-entries.schema';

// Join table: links shipments to customs entries (many-to-many)
// A shipment can have multiple pedimentos (e.g., consolidated, rectifications)
export const shipmentEntries = pgTable(
  'shipment_entries',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    shipmentId: text('shipment_id')
      .notNull()
      .references(() => shipments.id, { onDelete: 'cascade' }),
    entryId: text('entry_id')
      .notNull()
      .references(() => customsEntries.id),
    // Relationship type (e.g., "PRIMARY", "CONSOLIDATED", "RECTIFICATION")
    relationship: text('relationship').notNull().default('PRIMARY'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique('uq_shipment_entry').on(table.shipmentId, table.entryId)],
);
