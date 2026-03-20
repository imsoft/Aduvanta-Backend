import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';

// Registros SAAI M3 — tipos de trámite/documento en el sistema SAAI
export const saaiRegistroTypes = pgTable('saai_registro_types', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: integer('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
