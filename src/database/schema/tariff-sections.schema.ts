import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

// TIGIE Section — top level of tariff classification (e.g., Section I: Live Animals)
export const tariffSections = pgTable('tariff_sections', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  // Roman numeral code (I, II, III, ..., XXII)
  code: text('code').notNull().unique(),
  // Display order for sorting
  sortOrder: integer('sort_order').notNull(),
  title: text('title').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
