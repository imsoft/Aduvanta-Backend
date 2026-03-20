import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { operations } from './operations.schema';
import { documentCategories } from './document-categories.schema';

export const documentStatusEnum = pgEnum('document_status', [
  'ACTIVE',
  'INACTIVE',
]);

export type DocumentStatus = (typeof documentStatusEnum.enumValues)[number];

export const documents = pgTable('documents', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  operationId: text('operation_id')
    .notNull()
    .references(() => operations.id, { onDelete: 'restrict' }),
  categoryId: text('category_id').references(() => documentCategories.id, {
    onDelete: 'set null',
  }),
  name: text('name').notNull(),
  description: text('description'),
  storageKey: text('storage_key').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeInBytes: integer('size_in_bytes').notNull(),
  // References Better Auth user — no FK to avoid drizzle-kit migration conflicts.
  uploadedById: text('uploaded_by_id').notNull(),
  status: documentStatusEnum('status').notNull().default('ACTIVE'),
  isClientVisible: boolean('is_client_visible').notNull().default(false),
  currentVersionNumber: integer('current_version_number').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
