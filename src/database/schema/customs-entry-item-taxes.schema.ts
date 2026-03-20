import { pgTable, text, numeric, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { customsEntryItems } from './customs-entry-items.schema.js';

export const taxTypeEnum = pgEnum('tax_type', [
  'IGI', // Impuesto General de Importación
  'IGE', // Impuesto General de Exportación
  'IVA', // Impuesto al Valor Agregado
  'IEPS', // Impuesto Especial sobre Producción y Servicios
  'ISAN', // Impuesto sobre Automóviles Nuevos
  'DTA', // Derecho de Trámite Aduanero
  'PRV', // Prevalidación
  'CC', // Cuota Compensatoria (anti-dumping duty)
  'OTHER',
]);

// Taxes and duties calculated per line item (partida)
export const customsEntryItemTaxes = pgTable('customs_entry_item_taxes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  itemId: text('item_id')
    .notNull()
    .references(() => customsEntryItems.id, { onDelete: 'cascade' }),
  type: taxTypeEnum('type').notNull(),
  // Tax rate applied (percentage, e.g., "16.00" for 16% IVA)
  rate: numeric('rate', { precision: 8, scale: 4 }).notNull(),
  // Base amount on which the tax is calculated (MXN)
  baseAmount: numeric('base_amount', { precision: 16, scale: 2 }).notNull(),
  // Calculated tax amount (MXN)
  amount: numeric('amount', { precision: 16, scale: 2 }).notNull(),
  // Form of payment: 0=cash, 6=pending (diferido), etc.
  paymentForm: text('payment_form'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
