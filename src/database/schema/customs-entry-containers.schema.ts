import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { customsEntries } from './customs-entries.schema';

// Containers, rail cars, and vehicle economic numbers per pedimento
export const customsEntryContainers = pgTable('customs_entry_containers', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  entryId: text('entry_id')
    .notNull()
    .references(() => customsEntries.id, { onDelete: 'cascade' }),
  // Container/railcar/vehicle number
  number: text('number').notNull(),
  // 'CONTAINER' | 'RAILCAR' | 'VEHICLE'
  containerType: text('container_type'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
