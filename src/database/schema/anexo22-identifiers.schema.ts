import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

// Apéndice 8: Identificadores (nivel pedimento y partida)
export const anexo22Identifiers = pgTable('anexo22_identifiers', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: text('code').notNull().unique(),
  description: text('description').notNull(),
  level: text('level'),
  complement: text('complement'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
