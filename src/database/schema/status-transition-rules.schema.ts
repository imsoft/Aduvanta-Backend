import { boolean, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { ruleSets } from './rule-sets.schema';
import { operationStatusEnum } from './operations.schema';

export const statusTransitionRules = pgTable(
  'status_transition_rules',
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
    fromStatus: operationStatusEnum('from_status').notNull(),
    toStatus: operationStatusEnum('to_status').notNull(),
    requiresAllRequiredDocuments: boolean('requires_all_required_documents')
      .notNull()
      .default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    unique('status_rule_from_to_unique').on(t.ruleSetId, t.fromStatus, t.toStatus),
  ],
);
