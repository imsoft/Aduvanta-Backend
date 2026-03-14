import { boolean, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';

export const featureFlags = pgTable(
  'feature_flags',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    key: text('key').notNull(),
    description: text('description'),
    isEnabled: boolean('is_enabled').notNull().default(false),
    // Null means global (platform-wide). Non-null means org-specific override.
    organizationId: text('organization_id').references(() => organizations.id, {
      onDelete: 'cascade',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [unique('feature_flags_key_org_unique').on(t.key, t.organizationId)],
);
