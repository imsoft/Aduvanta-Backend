import {
  pgTable,
  text,
  numeric,
  timestamp,
  date,
  pgEnum,
  boolean,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { customsEntries } from './customs-entries.schema';

// COVE document type
export const eDocumentTypeEnum = pgEnum('e_document_type', [
  'COVE_IMPORT', // Comprobante de Valor Electrónico — importación
  'COVE_EXPORT', // Comprobante de Valor Electrónico — exportación
  'EDOCUMENT_COMPLEMENT', // Complemento de comprobante
]);

// Transmission status to VUCEM / SAT
export const eDocumentStatusEnum = pgEnum('e_document_status', [
  'DRAFT',
  'VALIDATING',
  'TRANSMITTED', // Sent to VUCEM
  'ACCEPTED', // Accepted by SAT
  'REJECTED', // Rejected by SAT
  'CANCELLED', // Cancelled after acceptance
]);

// COVE / E-Document — Comprobante de Valor Electrónico
export const eDocuments = pgTable('e_documents', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  // Link to customs entry (pedimento)
  entryId: text('entry_id').references(() => customsEntries.id),
  type: eDocumentTypeEnum('type').notNull(),
  status: eDocumentStatusEnum('status').notNull().default('DRAFT'),
  // COVE number assigned by VUCEM (e.g., COVE-XXXXXXXXXXXX)
  coveNumber: text('cove_number'),
  // E-document number (internal reference)
  documentNumber: text('document_number'),
  // Date of the COVE
  documentDate: date('document_date'),
  // Seller / exporter
  sellerName: text('seller_name').notNull(),
  sellerTaxId: text('seller_tax_id'),
  sellerAddress: text('seller_address'),
  sellerCountry: text('seller_country'),
  // Buyer / importer
  buyerName: text('buyer_name').notNull(),
  buyerTaxId: text('buyer_tax_id'),
  buyerAddress: text('buyer_address'),
  buyerCountry: text('buyer_country'),
  // Invoice reference
  invoiceNumber: text('invoice_number'),
  invoiceDate: date('invoice_date'),
  invoiceCurrency: text('invoice_currency'),
  // Totals
  totalInvoiceValue: numeric('total_invoice_value', {
    precision: 16,
    scale: 2,
  }),
  totalItems: text('total_items'),
  // Subdivision flag (if COVE is subdivided for multiple pedimentos)
  isSubdivided: boolean('is_subdivided').notNull().default(false),
  parentEDocumentId: text('parent_e_document_id'),
  // Observations / notes
  observations: text('observations'),
  // Transmission metadata
  transmittedAt: timestamp('transmitted_at', { withTimezone: true }),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  rejectedAt: timestamp('rejected_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),
  // SAT response data (raw JSON stored as text)
  satResponse: text('sat_response'),
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
