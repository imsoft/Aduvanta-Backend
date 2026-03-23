import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { customsEntries } from './customs-entries.schema';

// Documents attached to a customs entry (invoices, permits, certificates, etc.)
export const customsEntryDocuments = pgTable('customs_entry_documents', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  entryId: text('entry_id')
    .notNull()
    .references(() => customsEntries.id, { onDelete: 'cascade' }),
  // Document type code per SAT catalog
  documentTypeCode: text('document_type_code').notNull(),
  documentTypeName: text('document_type_name').notNull(),
  // Document number/identifier
  documentNumber: text('document_number'),
  // Date on the document
  documentDate: text('document_date'),
  // Issuing entity
  issuedBy: text('issued_by'),
  // S3/storage key if a file is attached
  storageKey: text('storage_key'),
  // Observations
  observations: text('observations'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
