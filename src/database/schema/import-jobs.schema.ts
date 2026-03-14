import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';

export const importTypeEnum = pgEnum('import_type', ['CLIENTS']);

export type ImportType = (typeof importTypeEnum.enumValues)[number];

export const importJobStatusEnum = pgEnum('import_job_status', [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
]);

export type ImportJobStatus = (typeof importJobStatusEnum.enumValues)[number];

export const importJobs = pgTable('import_jobs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  type: importTypeEnum('type').notNull(),
  status: importJobStatusEnum('status').notNull().default('PENDING'),
  fileName: text('file_name'),
  storageKey: text('storage_key'),
  // References Better Auth user — no FK to avoid drizzle-kit migration conflicts.
  requestedById: text('requested_by_id').notNull(),
  // JSON summary: { processed, created, failed, errors }
  resultSummaryJson: text('result_summary_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});
