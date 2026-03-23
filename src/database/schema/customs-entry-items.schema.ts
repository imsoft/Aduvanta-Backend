import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
} from 'drizzle-orm/pg-core';
import { customsEntries } from './customs-entries.schema';
import { tariffFractions } from './tariff-fractions.schema';

// Line items (partidas) within a customs entry
export const customsEntryItems = pgTable('customs_entry_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  entryId: text('entry_id')
    .notNull()
    .references(() => customsEntries.id, { onDelete: 'cascade' }),
  // Sequential item number within the entry (1, 2, 3...)
  itemNumber: integer('item_number').notNull(),
  // Tariff fraction reference
  tariffFractionId: text('tariff_fraction_id')
    .notNull()
    .references(() => tariffFractions.id),
  // Tariff fraction code snapshot (denormalized for historical accuracy)
  tariffFractionCode: text('tariff_fraction_code').notNull(),
  // Description of the goods
  description: text('description').notNull(),
  // Origin country for this specific item
  originCountry: text('origin_country').notNull(),
  // Quantity and measurement
  quantity: numeric('quantity', { precision: 16, scale: 4 }).notNull(),
  measurementUnit: text('measurement_unit').notNull(),
  // Weight in kilograms
  grossWeightKg: numeric('gross_weight_kg', { precision: 16, scale: 4 }),
  netWeightKg: numeric('net_weight_kg', { precision: 16, scale: 4 }),
  // Commercial value in invoice currency
  commercialValueCurrency: numeric('commercial_value_currency', {
    precision: 16,
    scale: 2,
  }).notNull(),
  // Commercial value in USD
  commercialValueUsd: numeric('commercial_value_usd', {
    precision: 16,
    scale: 2,
  }).notNull(),
  // Customs value in MXN (valor en aduana — base for tax calculation)
  customsValueMxn: numeric('customs_value_mxn', {
    precision: 16,
    scale: 2,
  }).notNull(),
  // Incrementable costs (freight, insurance, etc.) prorated to this item
  incrementablesMxn: numeric('incrementables_mxn', {
    precision: 16,
    scale: 2,
  }),
  // Trade agreement applied (if preferential rate used)
  tradeAgreementCode: text('trade_agreement_code'),
  // Brand, model, serial number (for controlled goods)
  brand: text('brand'),
  model: text('model'),
  serialNumber: text('serial_number'),
  // Observations for this item
  observations: text('observations'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
