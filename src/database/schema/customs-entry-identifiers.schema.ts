import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { customsEntries } from './customs-entries.schema';
import { customsEntryItems } from './customs-entry-items.schema';

// Identifiers (identificadores) at pedimento and partida level — Anexo 22 catalog
export const customsEntryIdentifiers = pgTable('customs_entry_identifiers', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  entryId: text('entry_id')
    .notNull()
    .references(() => customsEntries.id, { onDelete: 'cascade' }),
  // Null = pedimento level; set = partida level
  itemId: text('item_id').references(() => customsEntryItems.id, {
    onDelete: 'cascade',
  }),
  // 'PEDIMENTO' | 'PARTIDA'
  level: text('level').notNull(),
  // Identifier key code (clave identificador — Anexo 22)
  code: text('code').notNull(),
  complement1: text('complement1'),
  complement2: text('complement2'),
  complement3: text('complement3'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
