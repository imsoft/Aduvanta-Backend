import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';

// Catálogo de errores SAAI (Sistema Automatizado Aduanero Integral)
export const saaiErrorCodes = pgTable('saai_error_codes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  registro: integer('registro').notNull(),
  campo: integer('campo').notNull(),
  tipo: integer('tipo').notNull(),
  numero: integer('numero').notNull(),
  description: text('description').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
