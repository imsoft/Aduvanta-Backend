import {
  pgTable,
  text,
  numeric,
  timestamp,
  date,
  boolean,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema.js';
import { clients } from './clients.schema.js';

export const accountMovementTypeEnum = pgEnum('account_movement_type', [
  // Credits (ingress to client account)
  'ADVANCE_RECEIVED', // Anticipo recibido del cliente
  'OVERPAYMENT_CREDIT', // Crédito por pago en exceso
  'CORRECTION_CREDIT', // Crédito por corrección

  // Debits (egress from client account)
  'CUSTOMS_DUTIES_PAID', // Derechos aduaneros pagados por la agencia
  'STORAGE_PAID', // Almacenaje pagado
  'TRANSPORT_PAID', // Transporte pagado
  'AGENCY_FEE', // Honorarios agencia
  'OTHER_EXPENSES', // Otros gastos
  'INVOICE_CHARGED', // Cargo por factura emitida
  'CORRECTION_DEBIT', // Débito por corrección
]);

export const statementStatusEnum = pgEnum('account_statement_status', [
  'DRAFT', // Not yet sent to client
  'SENT', // Sent to client
  'ACKNOWLEDGED', // Client acknowledged receipt
  'DISPUTED', // Client disputes balance
  'CLOSED', // Reconciled and closed
]);

// client_account_movements — every debit/credit affecting a client's running account
// This is the cuenta corriente: a running account per client tracking advances,
// duty payments made on their behalf, agency fees, and settlements.
export const clientAccountMovements = pgTable('client_account_movements', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'restrict' }),

  type: accountMovementTypeEnum('type').notNull(),

  // Amount: positive = credit (favor of client), negative = debit (client owes)
  amount: numeric('amount', { precision: 16, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('MXN'),
  exchangeRate: numeric('exchange_rate', { precision: 12, scale: 4 }),

  // Reference to the source document
  operationId: text('operation_id'),
  entryId: text('entry_id'),
  invoiceId: text('invoice_id'),
  advanceId: text('advance_id'),

  // Running balance after this movement
  balanceBefore: numeric('balance_before', { precision: 16, scale: 2 }),
  balanceAfter: numeric('balance_after', { precision: 16, scale: 2 }),

  description: text('description').notNull(),
  reference: text('reference'),
  movementDate: date('movement_date').notNull(),

  isReconciled: boolean('is_reconciled').notNull().default(false),
  reconciledAt: timestamp('reconciled_at', { withTimezone: true }),

  createdById: text('created_by_id').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// client_account_statements — periodic statement sent to client
export const clientAccountStatements = pgTable('client_account_statements', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'restrict' }),

  statementNumber: text('statement_number').notNull(),
  status: statementStatusEnum('status').notNull().default('DRAFT'),

  // Period
  periodFrom: date('period_from').notNull(),
  periodTo: date('period_to').notNull(),

  // Balances
  openingBalance: numeric('opening_balance', { precision: 16, scale: 2 }).notNull(),
  totalCredits: numeric('total_credits', { precision: 16, scale: 2 }).notNull(),
  totalDebits: numeric('total_debits', { precision: 16, scale: 2 }).notNull(),
  closingBalance: numeric('closing_balance', { precision: 16, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('MXN'),

  // Metadata
  movementCount: integer('movement_count').notNull().default(0),
  notes: text('notes'),

  // Delivery
  sentAt: timestamp('sent_at', { withTimezone: true }),
  sentToEmail: text('sent_to_email'),
  acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),

  // PDF file
  fileKey: text('file_key'),

  createdById: text('created_by_id').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// client_funds — advance funds held by the agency for a client
// The agency holds funds from the client to pay customs duties on their behalf
export const clientFunds = pgTable('client_funds', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'restrict' }),

  // Current fund balance held by the agency
  availableBalance: numeric('available_balance', { precision: 16, scale: 2 })
    .notNull()
    .default('0'),
  reservedBalance: numeric('reserved_balance', { precision: 16, scale: 2 })
    .notNull()
    .default('0'),
  currency: text('currency').notNull().default('MXN'),

  // Minimum fund level — alert when below this
  minimumFundAlert: numeric('minimum_fund_alert', { precision: 16, scale: 2 }),
  alertSent: boolean('alert_sent').notNull().default(false),

  lastMovementAt: timestamp('last_movement_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
