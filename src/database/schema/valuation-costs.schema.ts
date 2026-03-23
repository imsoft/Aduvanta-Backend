import { pgTable, text, numeric, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { valuationDeclarations } from './valuation-declarations.schema';

export const costCategoryEnum = pgEnum('cost_category', [
  'INCREMENTABLE',
  'NON_INCREMENTABLE',
]);

export const costTypeEnum = pgEnum('cost_type', [
  // Incrementable costs (add to customs value)
  'FREIGHT', // Flete
  'INSURANCE', // Seguro
  'LOADING_UNLOADING', // Carga y descarga
  'HANDLING', // Manejo
  'PACKING', // Embalaje
  'COMMISSIONS', // Comisiones (agente de venta)
  'ROYALTIES', // Regalías y derechos de licencia
  'ASSISTS', // Prestaciones (moldes, herramientas, etc.)
  'SUBSEQUENT_PROCEEDS', // Producto de reventa al vendedor
  'OTHER_INCREMENTABLE',
  // Non-incrementable costs (do NOT add to customs value)
  'INLAND_FREIGHT_MX', // Flete interior en México
  'CUSTOMS_DUTIES', // Aranceles
  'ASSEMBLY_MX', // Montaje/instalación en México
  'TECHNICAL_ASSISTANCE', // Asistencia técnica
  'BUYING_COMMISSIONS', // Comisiones de compra
  'INTEREST', // Intereses por pago diferido
  'OTHER_NON_INCREMENTABLE',
]);

// Incrementable and non-incrementable costs for a valuation declaration
export const valuationCosts = pgTable('valuation_costs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  declarationId: text('declaration_id')
    .notNull()
    .references(() => valuationDeclarations.id, { onDelete: 'cascade' }),
  category: costCategoryEnum('category').notNull(),
  type: costTypeEnum('type').notNull(),
  description: text('description').notNull(),
  // Cost in original currency
  amountCurrency: numeric('amount_currency', { precision: 16, scale: 2 }),
  currency: text('currency'),
  // Cost in MXN
  amountMxn: numeric('amount_mxn', { precision: 16, scale: 2 }).notNull(),
  // How cost is prorated across items: "BY_VALUE", "BY_WEIGHT", "BY_QUANTITY", "EQUAL"
  prorationMethod: text('proration_method'),
  observations: text('observations'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
