import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  date,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { customsEntries } from './customs-entries.schema';

// WTO valuation methods (Articles 1-8 of the WTO Customs Valuation Agreement)
export const valuationMethodEnum = pgEnum('valuation_method', [
  'TRANSACTION_VALUE', // Art. 1 — Transaction value of imported goods
  'IDENTICAL_GOODS', // Art. 2 — Transaction value of identical goods
  'SIMILAR_GOODS', // Art. 3 — Transaction value of similar goods
  'DEDUCTIVE_VALUE', // Art. 5 — Deductive value
  'COMPUTED_VALUE', // Art. 6 — Computed value
  'FALLBACK', // Art. 7 — Fallback method (reasonable means)
]);

export const valuationStatusEnum = pgEnum('valuation_status', [
  'DRAFT',
  'COMPLETED',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
]);

// Manifestación de Valor en Aduana — customs value declaration
export const valuationDeclarations = pgTable('valuation_declarations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  // Linked customs entry (pedimento)
  entryId: text('entry_id').references(() => customsEntries.id),
  status: valuationStatusEnum('status').notNull().default('DRAFT'),
  valuationMethod: valuationMethodEnum('valuation_method')
    .notNull()
    .default('TRANSACTION_VALUE'),
  // Declaration number (internal sequential)
  declarationNumber: text('declaration_number'),
  // Declaration date
  declarationDate: date('declaration_date'),
  // Customs office
  customsOfficeName: text('customs_office_name'),
  // Supplier / seller information
  supplierName: text('supplier_name').notNull(),
  supplierTaxId: text('supplier_tax_id'),
  supplierAddress: text('supplier_address'),
  supplierCountry: text('supplier_country'),
  // Buyer / importer information
  buyerName: text('buyer_name').notNull(),
  buyerTaxId: text('buyer_tax_id'),
  buyerAddress: text('buyer_address'),
  // Invoice details
  invoiceNumber: text('invoice_number'),
  invoiceDate: date('invoice_date'),
  invoiceCurrency: text('invoice_currency'),
  // Exchange rate applied
  exchangeRate: numeric('exchange_rate', { precision: 12, scale: 4 }),
  // Totals
  totalInvoiceValue: numeric('total_invoice_value', {
    precision: 16,
    scale: 2,
  }),
  totalInvoiceValueMxn: numeric('total_invoice_value_mxn', {
    precision: 16,
    scale: 2,
  }),
  totalIncrementables: numeric('total_incrementables', {
    precision: 16,
    scale: 2,
  }),
  totalNonIncrementables: numeric('total_non_incrementables', {
    precision: 16,
    scale: 2,
  }),
  totalCustomsValue: numeric('total_customs_value', {
    precision: 16,
    scale: 2,
  }),
  // Incoterm (EXW, FOB, CIF, etc.)
  incoterm: text('incoterm'),
  // Number of items in the declaration
  totalItems: integer('total_items'),
  observations: text('observations'),
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
