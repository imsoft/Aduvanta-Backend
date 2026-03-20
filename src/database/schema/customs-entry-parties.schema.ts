import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { customsEntries } from './customs-entries.schema.js';

export const entryPartyRoleEnum = pgEnum('entry_party_role', [
  'IMPORTER',
  'EXPORTER',
  'SELLER',
  'BUYER',
  'CUSTOMS_BROKER',
  'CARRIER',
  'CONSIGNEE',
  'OTHER',
]);

// Parties involved in a customs entry (importador, exportador, vendedor, etc.)
export const customsEntryParties = pgTable('customs_entry_parties', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  entryId: text('entry_id')
    .notNull()
    .references(() => customsEntries.id, { onDelete: 'cascade' }),
  role: entryPartyRoleEnum('role').notNull(),
  // Tax ID (RFC for Mexican entities, Tax ID for foreign)
  taxId: text('tax_id').notNull(),
  name: text('name').notNull(),
  address: text('address'),
  country: text('country'),
  // CURP (for individuals in Mexico)
  curp: text('curp'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
