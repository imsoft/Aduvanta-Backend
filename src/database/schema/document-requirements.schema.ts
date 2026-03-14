import { boolean, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { ruleSets } from './rule-sets.schema';
import { documentCategories } from './document-categories.schema';

export const documentRequirements = pgTable(
  'document_requirements',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    ruleSetId: text('rule_set_id')
      .notNull()
      .references(() => ruleSets.id, { onDelete: 'cascade' }),
    documentCategoryId: text('document_category_id')
      .notNull()
      .references(() => documentCategories.id, { onDelete: 'cascade' }),
    isRequired: boolean('is_required').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    unique('doc_req_rule_set_category_unique').on(t.ruleSetId, t.documentCategoryId),
  ],
);
