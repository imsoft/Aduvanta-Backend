import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

export const productEvents = pgTable(
  'product_events',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    // Deduplication: client-generated event ID
    eventId: text('event_id').notNull().unique(),
    // Core dimensions
    userId: text('user_id'),
    organizationId: text('organization_id'),
    sessionId: text('session_id'),
    // Event classification
    category: text('category').notNull(),
    eventName: text('event_name').notNull(),
    // Payload
    properties: jsonb('properties').$type<Record<string, unknown>>(),
    // Context
    source: text('source').notNull(), // 'client' | 'server'
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    referrer: text('referrer'),
    // Page/route context (client events)
    pageUrl: text('page_url'),
    // Numeric value for aggregation (e.g., duration in ms, count)
    numericValue: integer('numeric_value'),
    // Timestamps
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Primary query patterns:
    // 1. Events by org + time range (dashboard, funnels)
    index('idx_product_events_org_occurred').on(
      table.organizationId,
      table.occurredAt,
    ),
    // 2. Events by user + time (user journey, retention)
    index('idx_product_events_user_occurred').on(
      table.userId,
      table.occurredAt,
    ),
    // 3. Events by name + time (event counts, feature adoption)
    index('idx_product_events_name_occurred').on(
      table.eventName,
      table.occurredAt,
    ),
    // 4. Session analysis
    index('idx_product_events_session').on(table.sessionId),
    // 5. Category filtering
    index('idx_product_events_category').on(table.category, table.occurredAt),
  ],
);
