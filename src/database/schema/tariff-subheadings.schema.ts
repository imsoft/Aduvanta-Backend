import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { tariffHeadings } from './tariff-headings.schema.js';

// TIGIE Subheading (Subpartida) — six-digit level (e.g., 010121: Pure-bred breeding horses)
export const tariffSubheadings = pgTable('tariff_subheadings', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  headingId: text('heading_id')
    .notNull()
    .references(() => tariffHeadings.id),
  // Six-digit code (010121, 010129, etc.)
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
