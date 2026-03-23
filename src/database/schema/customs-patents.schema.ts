import { pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';

// Customs broker patent numbers — organization-scoped
// A customs brokerage firm can hold multiple patents across different customs offices.
export const customsPatents = pgTable(
  'customs_patents',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id),
    // Patent number (4-digit, e.g., "3420")
    patentNumber: text('patent_number').notNull(),
    // Name of the licensed customs broker
    brokerName: text('broker_name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique('uq_org_patent').on(table.organizationId, table.patentNumber),
  ],
);
