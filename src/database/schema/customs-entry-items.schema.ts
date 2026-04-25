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
  // Tariff subdivision (SUBD) — Anexo 22 catalog
  tariffSubdivision: text('tariff_subdivision'),
  // Valuation method (MET VAL) — 1=Transaction value, 2=Identical goods, etc.
  valuationMethod: integer('valuation_method'),
  // Description of the goods
  description: text('description').notNull(),
  // Origin country for this specific item
  originCountry: text('origin_country').notNull(),
  // Quantity in tariff unit of measure (UMT)
  quantity: numeric('quantity', { precision: 16, scale: 4 }).notNull(),
  measurementUnit: text('measurement_unit').notNull(),
  // Commercial quantity in commercial unit of measure (UMC) — may differ from UMT
  commercialQuantity: numeric('commercial_quantity', { precision: 16, scale: 4 }),
  commercialUnitOfMeasure: text('commercial_unit_of_measure'),
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
  // Price paid / commercial value per unit — PRECIO PAGADO / VALOR COMERCIAL
  paidPriceUsd: numeric('paid_price_usd', { precision: 16, scale: 4 }),
  // Unit price in USD — PRECIO UNITARIO
  unitPriceUsd: numeric('unit_price_usd', { precision: 16, scale: 4 }),
  // Customs value in MXN (valor en aduana — base for tax calculation)
  customsValueMxn: numeric('customs_value_mxn', {
    precision: 16,
    scale: 2,
  }).notNull(),
  // Customs value in USD (VAL ADU/USD)
  customsValueUsd: numeric('customs_value_usd', { precision: 16, scale: 2 }),
  // Incrementable costs (freight, insurance, etc.) prorated to this item
  incrementablesMxn: numeric('incrementables_mxn', {
    precision: 16,
    scale: 2,
  }),
  // Added value (VAL. AGREG.) — for IMMEX/maquiladora operations
  addedValueMxn: numeric('added_value_mxn', { precision: 16, scale: 2 }),
  // Trade agreement applied (if preferential rate used)
  tradeAgreementCode: text('trade_agreement_code'),
  // Vinculación a nivel partida
  vinculacion: text('vinculacion'),
  // Brand, model, serial number (for controlled goods)
  brand: text('brand'),
  model: text('model'),
  serialNumber: text('serial_number'),
  // Product code (código producto) — for specific goods
  productCode: text('product_code'),
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
