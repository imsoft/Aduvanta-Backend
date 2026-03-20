import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
} from 'drizzle-orm/pg-core';
import { valuationDeclarations } from './valuation-declarations.schema.js';

// Individual product/item in a valuation declaration (Hoja de Cálculo line)
export const valuationItems = pgTable('valuation_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  declarationId: text('declaration_id')
    .notNull()
    .references(() => valuationDeclarations.id, { onDelete: 'cascade' }),
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
  // Total value converted to MXN
  totalValueMxn: numeric('total_value_mxn', {
    precision: 16,
    scale: 2,
  }).notNull(),
  // Prorated incrementable costs for this item (MXN)
  incrementablesMxn: numeric('incrementables_mxn', {
    precision: 16,
    scale: 2,
  }),
  // Prorated non-incrementable costs for this item (MXN)
  nonIncrementablesMxn: numeric('non_incrementables_mxn', {
    precision: 16,
    scale: 2,
  }),
  // Final customs value for this item (MXN)
  customsValueMxn: numeric('customs_value_mxn', {
    precision: 16,
    scale: 2,
  }).notNull(),
  observations: text('observations'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
