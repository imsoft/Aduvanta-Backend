import { pgTable, text, timestamp, numeric, pgEnum } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';

export const kpiPeriodEnum = pgEnum('kpi_period', [
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'YEARLY',
]);

export const kpiSnapshots = pgTable('kpi_snapshots', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  metricName: text('metric_name').notNull(),
  period: kpiPeriodEnum('period').notNull(),
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
  value: numeric('value', { precision: 18, scale: 4 }).notNull(),
  previousValue: numeric('previous_value', { precision: 18, scale: 4 }),
  metadata: text('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
