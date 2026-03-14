import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { clients } from './clients.schema';

export const clientAddresses = pgTable('client_addresses', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull(),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  country: text('country').notNull(),
  state: text('state'),
  city: text('city'),
  postalCode: text('postal_code'),
  street1: text('street1').notNull(),
  street2: text('street2'),
  reference: text('reference'),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
