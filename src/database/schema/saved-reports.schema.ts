import { pgTable, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema.js';

export const reportTypeEnum = pgEnum('report_type', [
  'OPERATIONS_SUMMARY', // Resumen de operaciones
  'CUSTOMS_ENTRIES', // Pedimentos
  'SHIPMENTS', // Embarques / tráfico
  'BILLING', // Facturación
  'EXPENSE_ACCOUNTS', // Cuentas de gastos
  'TREASURY', // Tesorería
  'INVENTORY', // Inventario almacén
  'COMPLIANCE', // Cumplimiento
  'CLIENTS', // Clientes
  'CUPO_USAGE', // Uso de CUPO
  'TARIFF_ANALYSIS', // Análisis arancelario
  'CUSTOM', // Reporte personalizado
]);

export const reportFormatEnum = pgEnum('report_format', [
  'TABLE', // Tabla
  'CHART', // Gráfica
  'SUMMARY', // Resumen / KPIs
  'PIVOT', // Tabla dinámica
]);

export const savedReports = pgTable('saved_reports', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  type: reportTypeEnum('type').notNull(),
  format: reportFormatEnum('format').notNull().default('TABLE'),
  name: text('name').notNull(),
  description: text('description'),
  queryConfig: text('query_config').notNull(),
  filtersConfig: text('filters_config'),
  columnsConfig: text('columns_config'),
  chartConfig: text('chart_config'),
  isShared: boolean('is_shared').notNull().default(false),
  isDefault: boolean('is_default').notNull().default(false),
  createdById: text('created_by_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
