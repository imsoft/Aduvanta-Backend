import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';

export const integrationProviderEnum = pgEnum('integration_provider', ['WEBHOOK']);

export type IntegrationProvider =
  (typeof integrationProviderEnum.enumValues)[number];

export const integrationStatusEnum = pgEnum('integration_status', [
  'ACTIVE',
  'INACTIVE',
]);

export type IntegrationStatus =
  (typeof integrationStatusEnum.enumValues)[number];

export const integrations = pgTable('integrations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  provider: integrationProviderEnum('provider').notNull(),
  name: text('name').notNull(),
  status: integrationStatusEnum('status').notNull().default('ACTIVE'),
  // Required for WEBHOOK provider
  targetUrl: text('target_url'),
  // Stored encrypted — never returned raw
  secretEncrypted: text('secret_encrypted'),
  // Comma-separated list of event type strings, e.g. "operation.created,document.created"
  eventTypes: text('event_types').notNull(),
  // Optional JSON blob for provider-specific extra config
  configJson: text('config_json'),
  // References Better Auth user — no FK to avoid drizzle-kit migration conflicts.
  createdById: text('created_by_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
