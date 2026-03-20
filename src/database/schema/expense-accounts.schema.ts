import {
  pgTable,
  text,
  numeric,
  timestamp,
  date,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema.js';
import { clients } from './clients.schema.js';

export const expenseAccountStatusEnum = pgEnum('expense_account_status', [
  'DRAFT',
  'GENERATED',
  'SENT_TO_CLIENT',
  'APPROVED_BY_CLIENT',
  'INVOICED',
  'CLOSED',
]);

// Cuenta de Gastos — expense account for a customs operation
export const expenseAccounts = pgTable('expense_accounts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id),
  status: expenseAccountStatusEnum('status').notNull().default('DRAFT'),
  // Reference number
  accountNumber: text('account_number'),
  // Related operation references
  shipmentId: text('shipment_id'),
  entryId: text('entry_id'),
  // Dates
  periodFrom: date('period_from'),
  periodTo: date('period_to'),
  generatedDate: date('generated_date'),
  // Currency
  currency: text('currency').notNull().default('MXN'),
  // Totals
  totalCharges: numeric('total_charges', {
    precision: 18,
    scale: 2,
  }).notNull(),
  totalAdvances: numeric('total_advances', {
    precision: 18,
    scale: 2,
  }).notNull(),
  balanceDue: numeric('balance_due', { precision: 18, scale: 2 }).notNull(),
  // Linked invoice (once invoiced)
  invoiceId: text('invoice_id'),
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
