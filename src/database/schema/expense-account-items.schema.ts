import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  date,
} from 'drizzle-orm/pg-core';
import { expenseAccounts } from './expense-accounts.schema';

// Individual line items in a Cuenta de Gastos
export const expenseAccountItems = pgTable('expense_account_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  expenseAccountId: text('expense_account_id')
    .notNull()
    .references(() => expenseAccounts.id, { onDelete: 'cascade' }),
  itemNumber: integer('item_number').notNull(),
  // Concept / category (same categories as invoice items)
  category: text('category').notNull(),
  description: text('description').notNull(),
  // Source reference (receipt, ticket, etc.)
  receiptNumber: text('receipt_number'),
  receiptDate: date('receipt_date'),
  // Amount
  amount: numeric('amount', { precision: 18, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('MXN'),
  exchangeRate: numeric('exchange_rate', { precision: 12, scale: 4 }),
  amountMxn: numeric('amount_mxn', { precision: 18, scale: 2 }).notNull(),
  // Tax
  taxAmount: numeric('tax_amount', { precision: 18, scale: 2 }),
  // Link to operation charge (if applicable)
  operationChargeId: text('operation_charge_id'),
  observations: text('observations'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
