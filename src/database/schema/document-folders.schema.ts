import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';

// Hierarchical folder structure for organizing documents
export const documentFolders = pgTable('document_folders', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  parentFolderId: text('parent_folder_id'),
  name: text('name').notNull(),
  path: text('path').notNull(),
  description: text('description'),
  // Linked entity (optional — ties folder to a shipment/entry/client)
  shipmentId: text('shipment_id'),
  entryId: text('entry_id'),
  clientId: text('client_id'),
  documentCount: integer('document_count').notNull().default(0),
  createdById: text('created_by_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
