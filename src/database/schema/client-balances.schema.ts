import { pgTable, text, numeric, timestamp, unique } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { clients } from './clients.schema';

// Running balance per client — tracks advances received vs charges incurred
export const clientBalances = pgTable(
  'client_balances',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id),
    clientId: text('client_id')
      .notNull()
      .references(() => clients.id),
    currency: text('currency').notNull().default('MXN'),
    // Total advances received from client
    totalAdvances: numeric('total_advances', {
      precision: 18,
      scale: 2,
    })
      .notNull()
      .default('0'),
    // Total charges applied to client
    totalCharges: numeric('total_charges', {
      precision: 18,
      scale: 2,
    })
      .notNull()
      .default('0'),
    // Current balance (advances - charges; positive = client has credit)
    currentBalance: numeric('current_balance', {
      precision: 18,
      scale: 2,
    })
      .notNull()
      .default('0'),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique('uq_client_balance_org_client_currency').on(
      table.organizationId,
      table.clientId,
      table.currency,
    ),
  ],
);
