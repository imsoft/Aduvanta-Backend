import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { tariffSubheadings } from './tariff-subheadings.schema';

export const measurementUnitEnum = pgEnum('measurement_unit', [
  'KG',
  'L',
  'M',
  'M2',
  'M3',
  'PZ',
  'PAR',
  'JGO',
  'GR',
  'KWH',
  'OTHER',
]);

// TIGIE Tariff Fraction (Fracción Arancelaria) — eight-digit level
// This is the most granular classification level and carries all tax/regulation data.
export const tariffFractions = pgTable('tariff_fractions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  subheadingId: text('subheading_id')
    .notNull()
    .references(() => tariffSubheadings.id),
  // Eight-digit fraction code (01012101, 01012102, etc.)
  code: text('code').notNull().unique(),
  sortOrder: integer('sort_order').notNull(),
  description: text('description').notNull(),
  measurementUnit: measurementUnitEnum('measurement_unit').notNull(),
  // Import tax rate (Impuesto General de Importación) — percentage or "Ex." (exempt)
  importTariffRate: text('import_tariff_rate').notNull(),
  // Export tax rate (Impuesto General de Exportación)
  exportTariffRate: text('export_tariff_rate').notNull(),
  // IVA rate — typically 16%, 0%, or exempt
  vatRate: numeric('vat_rate', { precision: 5, scale: 2 }),
  // IEPS rate (Impuesto Especial sobre Producción y Servicios)
  iepsRate: numeric('ieps_rate', { precision: 5, scale: 2 }),
  // ISAN (Impuesto sobre Automóviles Nuevos) — applies only to vehicles
  isanApplies: text('isan_applies'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
