import { boolean, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { operationTypeEnum } from './operations.schema';

export const ruleSets = pgTable(
  'rule_sets',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    code: text('code').notNull(),
    operationType: operationTypeEnum('operation_type').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [unique('rule_sets_code_org_unique').on(t.organizationId, t.code)],
);
