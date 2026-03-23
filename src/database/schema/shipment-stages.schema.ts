import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { shipments } from './shipments.schema';

// Individual stage/milestone in a shipment's lifecycle
// Tracks time spent at each stage for performance analysis
export const shipmentStages = pgTable('shipment_stages', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  shipmentId: text('shipment_id')
    .notNull()
    .references(() => shipments.id, { onDelete: 'cascade' }),
  // Stage name (e.g., "IN_TRANSIT", "AT_CUSTOMS", "PREVIO", "MODULATION", etc.)
  stageName: text('stage_name').notNull(),
  // Human-readable label (e.g., "En tránsito", "En aduana", "Previo")
  stageLabel: text('stage_label').notNull(),
  // When this stage started and ended
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  // Location where this stage occurred
  location: text('location'),
  // Who performed/recorded this stage
  performedById: text('performed_by_id'),
  // Additional notes or structured data
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
