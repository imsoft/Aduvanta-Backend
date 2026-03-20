import { boolean, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';

export const clientStatusEnum = pgEnum('client_status', ['ACTIVE', 'INACTIVE']);

export type ClientStatus = (typeof clientStatusEnum.enumValues)[number];

export const clients = pgTable('clients', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  legalName: text('legal_name'),
  taxId: text('tax_id'),
  email: text('email'),
  phone: text('phone'),
  status: clientStatusEnum('status').notNull().default('ACTIVE'),
  notes: text('notes'),
  // References Better Auth user — no FK to avoid drizzle-kit migration conflicts.
  createdById: text('created_by_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
