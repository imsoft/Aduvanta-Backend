import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Mexican customs offices (aduanas) — reference data
// e.g., "240" = Nuevo Laredo, "430" = Mexico City (AICM)
export const customsOffices = pgTable('customs_offices', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  // SAT official code (3-digit, e.g., "240", "430", "800")
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  // City/state where the customs office is located
  location: text('location'),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
