import { pgTable, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { savedReports } from './saved-reports.schema.js';

export const executionStatusEnum = pgEnum('report_execution_status', [
  'PENDING',
  'RUNNING',
  'COMPLETED',
  'FAILED',
]);

export const reportExecutions = pgTable('report_executions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  reportId: text('report_id')
    .notNull()
    .references(() => savedReports.id),
  status: executionStatusEnum('status').notNull().default('PENDING'),
  filtersApplied: text('filters_applied'),
  resultData: text('result_data'),
  rowCount: integer('row_count'),
  executionTimeMs: integer('execution_time_ms'),
  errorMessage: text('error_message'),
  exportStorageKey: text('export_storage_key'),
  exportFormat: text('export_format'),
  executedById: text('executed_by_id').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
