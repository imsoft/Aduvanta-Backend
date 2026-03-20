import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

// Apéndice 9: Regulaciones y restricciones no arancelarias (RRNA)
export const anexo22Rrna = pgTable('anexo22_rrna', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: text('code').notNull().unique(),
  description: text('description').notNull(),
  issuingAuthority: text('issuing_authority'),
  regulationType: text('regulation_type'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
