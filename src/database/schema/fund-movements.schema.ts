import {
  pgTable,
  text,
  numeric,
  timestamp,
  date,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { bankAccounts } from './bank-accounts.schema';

export const movementTypeEnum = pgEnum('movement_type', [
  'INCOME', // Ingreso (advance from client, payment received)
  'EXPENSE', // Egreso (payment to SAT, freight, services)
  'TRANSFER', // Transfer between accounts
  'ADJUSTMENT', // Manual balance adjustment
]);

export const movementStatusEnum = pgEnum('movement_status', [
  'PENDING',
  'CONFIRMED',
  'RECONCILED',
  'CANCELLED',
]);

export const movementCategoryEnum = pgEnum('movement_category', [
  // Income categories
  'CLIENT_ADVANCE', // Anticipo de cliente
  'CLIENT_PAYMENT', // Pago de cliente
  'REFUND_RECEIVED', // Devolución recibida
  // Expense categories
  'CUSTOMS_DUTY_PAYMENT', // Pago de contribuciones (IGI, IVA, DTA, etc.)
  'FREIGHT_PAYMENT', // Pago de flete
  'STORAGE_PAYMENT', // Pago de almacenaje
  'HANDLING_PAYMENT', // Pago de maniobras
  'PREVALIDATION_PAYMENT', // Pago de prevalidación
  'SERVICE_PROVIDER_PAYMENT', // Pago a proveedores de servicio
  'GOVERNMENT_FEE', // Derechos gubernamentales
  'REFUND_ISSUED', // Devolución emitida
  // Internal
  'INTERNAL_TRANSFER', // Traspaso entre cuentas
  'BALANCE_ADJUSTMENT', // Ajuste de saldo
  'OTHER', // Otro
]);

// Fund movements (ingresos y egresos)
export const fundMovements = pgTable('fund_movements', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  type: movementTypeEnum('type').notNull(),
  category: movementCategoryEnum('category').notNull(),
  status: movementStatusEnum('status').notNull().default('PENDING'),
  // Account references
  bankAccountId: text('bank_account_id')
    .notNull()
    .references(() => bankAccounts.id),
  // For transfers: destination account
  destinationAccountId: text('destination_account_id').references(
    () => bankAccounts.id,
  ),
  // Amount (positive for income, positive for expense — type determines direction)
  amount: numeric('amount', { precision: 18, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('MXN'),
  exchangeRate: numeric('exchange_rate', { precision: 12, scale: 4 }),
  amountMxn: numeric('amount_mxn', { precision: 18, scale: 2 }).notNull(),
  // Reference
  referenceNumber: text('reference_number'),
  description: text('description').notNull(),
  movementDate: date('movement_date').notNull(),
  // Linked entities
  clientId: text('client_id'),
  invoiceId: text('invoice_id'),
  paymentId: text('payment_id'),
  shipmentId: text('shipment_id'),
  entryId: text('entry_id'),
  // Balance after this movement
  balanceAfter: numeric('balance_after', { precision: 18, scale: 2 }),
  // Reconciliation
  reconciledAt: timestamp('reconciled_at', { withTimezone: true }),
  reconciledById: text('reconciled_by_id'),
  observations: text('observations'),
  createdById: text('created_by_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
