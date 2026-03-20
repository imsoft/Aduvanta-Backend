import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

// Apéndice 4: Países
export const anexo22Countries = pgTable('anexo22_countries', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  isoAlpha2: text('iso_alpha2'),
  isoAlpha3: text('iso_alpha3'),
  region: text('region'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
