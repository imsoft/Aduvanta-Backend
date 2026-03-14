import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { documents } from './documents.schema';

export const documentVersions = pgTable('document_versions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull(),
  documentId: text('document_id')
    .notNull()
    .references(() => documents.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  storageKey: text('storage_key').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeInBytes: integer('size_in_bytes').notNull(),
  // References Better Auth user — no FK to avoid drizzle-kit migration conflicts.
  uploadedById: text('uploaded_by_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
