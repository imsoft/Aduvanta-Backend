import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';

// Apéndice 1: Aduanas y secciones aduaneras
export const anexo22CustomsSections = pgTable('anexo22_customs_sections', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  sectionCode: text('section_code'),
  sectionName: text('section_name'),
  city: text('city'),
  state: text('state'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
