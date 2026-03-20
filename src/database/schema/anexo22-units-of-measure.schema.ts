import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

// Apéndice 7: Unidades de medida (comercial y tarifa)
export const anexo22UnitsOfMeasure = pgTable('anexo22_units_of_measure', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: text('code').notNull().unique(),
  description: text('description').notNull(),
  abbreviation: text('abbreviation'),
  unitType: text('unit_type'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
