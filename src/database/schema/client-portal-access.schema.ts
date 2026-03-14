import { pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { clients } from './clients.schema';

export const clientPortalAccess = pgTable(
  'client_portal_access',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    clientId: text('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    // References Better Auth's user table — no FK constraint to avoid
    // drizzle-kit migration conflicts with Better Auth-managed tables.
    userId: text('user_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('client_portal_access_unique').on(t.organizationId, t.clientId, t.userId),
  ],
);
