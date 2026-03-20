import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
} from 'drizzle-orm/pg-core';
import { eDocuments } from './e-documents.schema.js';

// Line items within a COVE / E-Document
export const eDocumentItems = pgTable('e_document_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eDocumentId: text('e_document_id')
    .notNull()
    .references(() => eDocuments.id, { onDelete: 'cascade' }),
  itemNumber: integer('item_number').notNull(),
  // Product identification
  description: text('description').notNull(),
  tariffFractionCode: text('tariff_fraction_code'),
  brand: text('brand'),
  model: text('model'),
  originCountry: text('origin_country'),
  // Quantity and unit
  quantity: numeric('quantity', { precision: 16, scale: 4 }).notNull(),
  measurementUnit: text('measurement_unit').notNull(),
  // Unit price in invoice currency
  unitPrice: numeric('unit_price', { precision: 16, scale: 4 }).notNull(),
  // Total value in invoice currency
  totalValue: numeric('total_value', { precision: 16, scale: 2 }).notNull(),
  // Specific identifiers (serial numbers, lot numbers, etc.)
  specificIdentifier: text('specific_identifier'),
  observations: text('observations'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
