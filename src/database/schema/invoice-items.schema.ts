import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { invoices } from './invoices.schema.js';

export const invoiceItemCategoryEnum = pgEnum('invoice_item_category', [
  'SERVICE_FEE', // Honorarios
  'CUSTOMS_DUTY', // Impuestos al comercio exterior (IGI, IGE)
  'TAX', // IVA, IEPS, ISAN
  'DTA', // Derecho de Trámite Aduanero
  'PRV', // Prevalidación
  'FREIGHT', // Flete
  'INSURANCE', // Seguro
  'STORAGE', // Almacenaje
  'HANDLING', // Maniobras
  'DOCUMENTATION', // Gastos de documentación
  'GOVERNMENT_FEE', // Derechos gubernamentales
  'OTHER', // Otros gastos
]);

// Individual line items on an invoice
export const invoiceItems = pgTable('invoice_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  invoiceId: text('invoice_id')
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  itemNumber: integer('item_number').notNull(),
  category: invoiceItemCategoryEnum('category').notNull(),
  // SAT product/service code (clave de producto o servicio)
  satProductCode: text('sat_product_code'),
  description: text('description').notNull(),
  measurementUnit: text('measurement_unit').notNull().default('E48'),
  quantity: numeric('quantity', { precision: 16, scale: 4 })
    .notNull()
    .default('1'),
  unitPrice: numeric('unit_price', { precision: 18, scale: 4 }).notNull(),
  subtotal: numeric('subtotal', { precision: 18, scale: 2 }).notNull(),
  // Tax details
  taxRate: numeric('tax_rate', { precision: 6, scale: 4 }),
  taxAmount: numeric('tax_amount', { precision: 18, scale: 2 }),
  total: numeric('total', { precision: 18, scale: 2 }).notNull(),
  // Link to specific charge or advance
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
