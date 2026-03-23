import {
  pgTable,
  text,
  numeric,
  timestamp,
  date,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { invoices } from './invoices.schema';

export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING',
  'CONFIRMED',
  'REVERSED',
  'CANCELLED',
]);

export const paymentMethodEnum = pgEnum('payment_method_type', [
  'CASH',
  'BANK_TRANSFER',
  'CHECK',
  'CREDIT_CARD',
  'DEBIT_CARD',
  'ELECTRONIC_WALLET',
  'COMPENSATION',
  'OTHER',
]);

// Payment records against invoices
export const payments = pgTable('payments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  invoiceId: text('invoice_id')
    .notNull()
    .references(() => invoices.id),
  status: paymentStatusEnum('status').notNull().default('PENDING'),
  method: paymentMethodEnum('method').notNull(),
  // Amount
  amount: numeric('amount', { precision: 18, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('MXN'),
  exchangeRate: numeric('exchange_rate', { precision: 12, scale: 4 }),
  // Payment reference
  reference: text('reference'),
  bankName: text('bank_name'),
  accountNumber: text('account_number'),
  // Dates
  paymentDate: date('payment_date').notNull(),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  // Notes
  notes: text('notes'),
  createdById: text('created_by_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
