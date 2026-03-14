import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { clients } from './clients.schema';

export const operationStatusEnum = pgEnum('operation_status', [
  'OPEN',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
]);

export const operationPriorityEnum = pgEnum('operation_priority', [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
]);

export const operationTypeEnum = pgEnum('operation_type', [
  'IMPORT',
  'EXPORT',
  'INTERNAL',
]);

export type OperationStatus = (typeof operationStatusEnum.enumValues)[number];
export type OperationPriority = (typeof operationPriorityEnum.enumValues)[number];
export type OperationType = (typeof operationTypeEnum.enumValues)[number];

export const operations = pgTable('operations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'restrict' }),
  reference: text('reference').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  type: operationTypeEnum('type').notNull(),
  status: operationStatusEnum('status').notNull().default('OPEN'),
  priority: operationPriorityEnum('priority').notNull().default('MEDIUM'),
  // References Better Auth user — no FK to avoid drizzle-kit migration conflicts.
  assignedUserId: text('assigned_user_id'),
  createdById: text('created_by_id').notNull(),
  openedAt: timestamp('opened_at', { withTimezone: true }),
  dueAt: timestamp('due_at', { withTimezone: true }),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
