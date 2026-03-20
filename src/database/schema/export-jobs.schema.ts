import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';

export const exportTypeEnum = pgEnum('export_type', [
  'CLIENTS',
  'OPERATIONS',
  'FINANCE',
]);

export type ExportType = (typeof exportTypeEnum.enumValues)[number];

export const exportJobStatusEnum = pgEnum('export_job_status', [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
]);

export type ExportJobStatus = (typeof exportJobStatusEnum.enumValues)[number];

export const exportJobs = pgTable('export_jobs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  type: exportTypeEnum('type').notNull(),
  status: exportJobStatusEnum('status').notNull().default('PENDING'),
  fileName: text('file_name'),
  storageKey: text('storage_key'),
  // References Better Auth user — no FK to avoid drizzle-kit migration conflicts.
  requestedById: text('requested_by_id').notNull(),
  // Optional JSON filters applied at export time
  filtersJson: text('filters_json'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});
