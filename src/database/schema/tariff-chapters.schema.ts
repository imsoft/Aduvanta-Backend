import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { tariffSections } from './tariff-sections.schema.js';

// TIGIE Chapter — two-digit level (e.g., Chapter 01: Live Animals)
export const tariffChapters = pgTable('tariff_chapters', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sectionId: text('section_id')
    .notNull()
    .references(() => tariffSections.id),
  // Two-digit chapter code (01, 02, ..., 98)
  code: text('code').notNull().unique(),
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
