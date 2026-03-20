import { integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { integrations } from './integrations.schema';

export const deliveryStatusEnum = pgEnum('delivery_status', [
  'PENDING',
  'SUCCESS',
  'FAILED',
]);

export type DeliveryStatus = (typeof deliveryStatusEnum.enumValues)[number];

export const integrationDeliveries = pgTable('integration_deliveries', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  integrationId: text('integration_id')
    .notNull()
    .references(() => integrations.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(),
  payloadJson: text('payload_json').notNull(),
  status: deliveryStatusEnum('status').notNull().default('PENDING'),
  responseStatus: integer('response_status'),
  responseBody: text('response_body'),
  attemptCount: integer('attempt_count').notNull().default(0),
  lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
