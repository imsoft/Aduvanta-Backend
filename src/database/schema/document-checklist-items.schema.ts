import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { documentChecklists } from './document-checklists.schema.js';

export const checklistItemStatusEnum = pgEnum('checklist_item_status', [
  'REQUIRED',
  'RECEIVED',
  'VERIFIED',
  'REJECTED',
  'WAIVED',
  'NOT_APPLICABLE',
]);

// Individual items in a document checklist
export const documentChecklistItems = pgTable('document_checklist_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  checklistId: text('checklist_id')
    .notNull()
    .references(() => documentChecklists.id, { onDelete: 'cascade' }),
  itemNumber: integer('item_number').notNull(),
  documentName: text('document_name').notNull(),
  description: text('description'),
  status: checklistItemStatusEnum('status').notNull().default('REQUIRED'),
  isRequired: boolean('is_required').notNull().default(true),
  // Link to actual uploaded document
  documentId: text('document_id'),
  // Verification
  verifiedById: text('verified_by_id'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),
  observations: text('observations'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
