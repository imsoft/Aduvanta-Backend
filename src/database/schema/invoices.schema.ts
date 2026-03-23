import {
  pgTable,
  text,
  numeric,
  timestamp,
  date,
  pgEnum,
  integer,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { clients } from './clients.schema';

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'DRAFT',
  'ISSUED',
  'SENT',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'CANCELLED',
  'CREDITED',
]);

export const invoiceTypeEnum = pgEnum('invoice_type', [
  'SERVICE', // Honorarios por servicios aduanales
  'REIMBURSEMENT', // Reembolso de gastos (cuenta de gastos)
  'ADVANCE_REQUEST', // Solicitud de anticipo
  'CREDIT_NOTE', // Nota de crédito
]);

// Invoices issued by the customs broker to clients
export const invoices = pgTable('invoices', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id),
  type: invoiceTypeEnum('type').notNull(),
  status: invoiceStatusEnum('status').notNull().default('DRAFT'),
  // Invoice identification
  invoiceNumber: text('invoice_number'),
  invoiceSeries: text('invoice_series'),
  // SAT CFDI UUID (once stamped)
  cfdiUuid: text('cfdi_uuid'),
  // Dates
  issueDate: date('issue_date'),
  dueDate: date('due_date'),
  // Currency
  currency: text('currency').notNull().default('MXN'),
  exchangeRate: numeric('exchange_rate', { precision: 12, scale: 4 }),
  // Amounts
  subtotal: numeric('subtotal', { precision: 18, scale: 2 }).notNull(),
  taxAmount: numeric('tax_amount', { precision: 18, scale: 2 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 18, scale: 2 }).notNull(),
  paidAmount: numeric('paid_amount', { precision: 18, scale: 2 })
    .notNull()
    .default('0'),
  balanceDue: numeric('balance_due', { precision: 18, scale: 2 }).notNull(),
  // CFDI metadata
  cfdiUsage: text('cfdi_usage'),
  paymentMethod: text('payment_method'),
  paymentForm: text('payment_form'),
  // Related operation/shipment references
  shipmentId: text('shipment_id'),
  entryId: text('entry_id'),
  // Linked credit note (if this is a credited invoice)
  creditNoteId: text('credit_note_id'),
  // Item count
  totalItems: integer('total_items'),
  observations: text('observations'),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancellationReason: text('cancellation_reason'),
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
