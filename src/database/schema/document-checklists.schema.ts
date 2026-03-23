import { pgTable, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';

export const checklistStatusEnum = pgEnum('checklist_status', [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETE',
  'WAIVED',
]);

// Document checklist — tracks required documents per shipment/entry
export const documentChecklists = pgTable('document_checklists', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  status: checklistStatusEnum('status').notNull().default('PENDING'),
  name: text('name').notNull(),
  // Linked entity
  shipmentId: text('shipment_id'),
  entryId: text('entry_id'),
  clientId: text('client_id'),
  // Progress
  totalItems: integer('total_items').notNull().default(0),
  completedItems: integer('completed_items').notNull().default(0),
  observations: text('observations'),
  createdById: text('created_by_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
