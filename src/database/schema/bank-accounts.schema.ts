import {
  pgTable,
  text,
  numeric,
  timestamp,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema.js';

export const bankAccountTypeEnum = pgEnum('bank_account_type', [
  'CHECKING', // Cuenta de cheques
  'SAVINGS', // Cuenta de ahorro
  'INVESTMENT', // Inversión
  'PETTY_CASH', // Caja chica
  'CUSTOMS_GUARANTEE', // Garantía aduanal
]);

// Organization bank accounts for treasury management
export const bankAccounts = pgTable('bank_accounts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  type: bankAccountTypeEnum('type').notNull(),
  bankName: text('bank_name').notNull(),
  accountName: text('account_name').notNull(),
  accountNumber: text('account_number'),
  clabe: text('clabe'),
  currency: text('currency').notNull().default('MXN'),
  currentBalance: numeric('current_balance', {
    precision: 18,
    scale: 2,
  })
    .notNull()
    .default('0'),
  isActive: boolean('is_active').notNull().default(true),
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
