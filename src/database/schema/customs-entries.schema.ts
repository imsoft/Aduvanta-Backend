import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  date,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { customsOffices } from './customs-offices.schema';
import { customsPatents } from './customs-patents.schema';

export const customsRegimeEnum = pgEnum('customs_regime', [
  'IMP_DEFINITIVA', // A1 — Importación definitiva
  'EXP_DEFINITIVA', // A2 — Exportación definitiva
  'IMP_TEMPORAL', // Importación temporal
  'EXP_TEMPORAL', // Exportación temporal
  'DEPOSITO_FISCAL', // Depósito fiscal
  'TRANSITO_INTERNO', // Tránsito interno
  'TRANSITO_INTERNACIONAL', // Tránsito internacional
  'ELABORACION_TRANSFORMACION', // Elaboración, transformación o reparación en recinto
  'REEXPEDICION', // Reexpedición
  'RETORNO', // Retorno de exportación temporal
  'REGULARIZACION', // Regularización
  'CAMBIO_REGIMEN', // Cambio de régimen
  'EXTRACCION_DEPOSITO', // Extracción de depósito fiscal
  'VIRTUAL', // Pedimento virtual (transferencias IMMEX)
  'OTHER',
]);

export const entryStatusEnum = pgEnum('entry_status', [
  'DRAFT', // Being created/edited
  'PREVALIDATED', // Passed syntactic/catalog validation
  'VALIDATED', // Officially validated
  'PAID', // Electronic payment processed
  'DISPATCHED', // Presented at customs (modulación)
  'RELEASED', // Cleared (desaduanamiento)
  'CANCELLED', // Cancelled
  'RECTIFIED', // Rectified (replaced by new version)
]);

// Customs entry (pedimento) — the core document of customs operations
export const customsEntries = pgTable('customs_entries', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  // Customs office where the entry is filed
  customsOfficeId: text('customs_office_id')
    .notNull()
    .references(() => customsOffices.id),
  // Patent used for this entry
  patentId: text('patent_id')
    .notNull()
    .references(() => customsPatents.id),
  // Pedimento number (assigned by system, unique per patent+office+year)
  // Format: 2 digits (last 2 of year) + 2 digits (customs office) + 4 digits (patent) + 7 digits (consecutive)
  entryNumber: text('entry_number'),
  // Pedimento key / clave de pedimento (e.g., "A1", "IN", "RT", "V1", "G1")
  entryKey: text('entry_key').notNull(),
  regime: customsRegimeEnum('regime').notNull(),
  status: entryStatusEnum('status').notNull().default('DRAFT'),

  // Operation type
  // 1 = Import, 2 = Export
  operationType: integer('operation_type').notNull(),

  // Dates
  entryDate: date('entry_date'),
  paymentDate: date('payment_date'),
  arrivalDate: date('arrival_date'),

  // Transport
  // Transport mode: 1=Maritime, 2=Rail, 3=Road, 4=Air, 5=Pipeline, 7=Multi
  transportMode: integer('transport_mode'),
  // Carrier name / transport company
  carrierName: text('carrier_name'),
  // Bill of lading / guía / carta porte number
  transportDocumentNumber: text('transport_document_number'),

  // Countries
  originCountry: text('origin_country'),
  destinationCountry: text('destination_country'),

  // Exchange rate used for USD→MXN conversion
  exchangeRate: numeric('exchange_rate', { precision: 12, scale: 4 }),

  // Currency code of the invoices (e.g., "USD", "EUR")
  invoiceCurrency: text('invoice_currency'),

  // Total values (calculated from items)
  totalCommercialValueUsd: numeric('total_commercial_value_usd', {
    precision: 16,
    scale: 2,
  }),
  totalCommercialValueMxn: numeric('total_commercial_value_mxn', {
    precision: 16,
    scale: 2,
  }),
  totalCustomsValueMxn: numeric('total_customs_value_mxn', {
    precision: 16,
    scale: 2,
  }),

  // Total duties and taxes (sum of all item taxes)
  totalDuties: numeric('total_duties', { precision: 16, scale: 2 }),
  totalVat: numeric('total_vat', { precision: 16, scale: 2 }),
  totalDta: numeric('total_dta', { precision: 16, scale: 2 }),
  totalOtherTaxes: numeric('total_other_taxes', { precision: 16, scale: 2 }),
  grandTotal: numeric('grand_total', { precision: 16, scale: 2 }),

  // Prevalidation results (JSONB for flexibility)
  prevalidationResult: jsonb('prevalidation_result'),

  // Electronic payment reference
  paymentReference: text('payment_reference'),

  // Internal reference / customs broker reference number
  internalReference: text('internal_reference'),

  // Observations / notes
  observations: text('observations'),

  // Who created/modified
  createdById: text('created_by_id').notNull(),
  updatedById: text('updated_by_id'),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
