import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { tariffChapters } from './tariff-chapters.schema';

// TIGIE Heading (Partida) — four-digit level (e.g., 0101: Live horses, asses, mules)
export const tariffHeadings = pgTable('tariff_headings', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  chapterId: text('chapter_id')
    .notNull()
    .references(() => tariffChapters.id),
  // Four-digit code (0101, 0102, ..., 9801)
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
