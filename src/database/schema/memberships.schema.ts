import { pgEnum, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';

export const membershipRoleEnum = pgEnum('membership_role', [
  'OWNER',
  'ADMIN',
  'MEMBER',
  'CLIENT',
]);

export type MembershipRole = (typeof membershipRoleEnum.enumValues)[number];

export const memberships = pgTable(
  'memberships',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    // References Better Auth's user table — no FK constraint to avoid
    // drizzle-kit migration conflicts with Better Auth-managed tables.
    userId: text('user_id').notNull(),
    role: membershipRoleEnum('role').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [unique('memberships_org_user_unique').on(t.organizationId, t.userId)],
);
