import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

// Apéndice 14: Tipos de operación
export const anexo22OperationTypes = pgTable('anexo22_operation_types', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: text('code').notNull().unique(),
  description: text('description').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
