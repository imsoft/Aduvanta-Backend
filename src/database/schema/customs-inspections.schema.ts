import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema.js';
import { customsEntries } from './customs-entries.schema.js';
import { shipments } from './shipments.schema.js';

export const inspectionTypeEnum = pgEnum('inspection_type', [
  'DOCUMENTAL', // Documentary review only
  'FISICO_ALEATORIO', // Random physical inspection
  'FISICO_SELECTIVO', // Selective physical inspection
  'FISICO_TOTAL', // Full physical inspection
  'RECONOCIMIENTO_ADUANERO', // Full customs recognition
]);

export const inspectionResultEnum = pgEnum('inspection_result', [
  'PENDING', // Not yet started
  'PASSED', // No discrepancies found
  'DISCREPANCY', // Discrepancies found but cleared
  'SEIZED', // Goods seized
  'PARTIAL_SEIZURE', // Partial seizure
  'SAMPLE_TAKEN', // Sample taken for analysis
]);

export const semaphoreColorEnum = pgEnum('semaphore_color', [
  'GREEN', // No physical inspection required
  'RED', // Physical inspection required
]);

// customs_inspections — tracks the semáforo fiscal and reconocimiento aduanero
// A customs entry passes through modulation (semáforo) when presented at customs
export const customsInspections = pgTable('customs_inspections', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  entryId: text('entry_id')
    .notNull()
    .references(() => customsEntries.id, { onDelete: 'restrict' }),
  shipmentId: text('shipment_id').references(() => shipments.id),

  // Semáforo / modulation result
  semaphoreColor: semaphoreColorEnum('semaphore_color'),
  modulationDate: timestamp('modulation_date', { withTimezone: true }),

  // Inspection details
  inspectionType: inspectionTypeEnum('inspection_type'),
  inspectionResult: inspectionResultEnum('inspection_result')
    .notNull()
    .default('PENDING'),

  // Inspector details
  inspectorName: text('inspector_name'),
  inspectorBadge: text('inspector_badge'),
  inspectionLocation: text('inspection_location'),

  // Dates
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),

  // Results
  packagesInspected: integer('packages_inspected'),
  discrepanciesFound: boolean('discrepancies_found').default(false),
  discrepancyDescription: text('discrepancy_description'),

  // Penalties
  penaltyAmount: numeric('penalty_amount', { precision: 16, scale: 2 }),
  penaltyCurrency: text('penalty_currency'),

  // Samples
  samplesTaken: integer('samples_taken').default(0),
  sampleDescription: text('sample_description'),

  // Additional docs
  actaNumber: text('acta_number'),
  actaFiledAt: timestamp('acta_filed_at', { withTimezone: true }),

  // Internal notes
  internalNotes: text('internal_notes'),
  metadata: jsonb('metadata'),

  createdById: text('created_by_id').notNull(),
  updatedById: text('updated_by_id'),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Inspection items — discrepancies at the item level
export const customsInspectionItems = pgTable('customs_inspection_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  inspectionId: text('inspection_id')
    .notNull()
    .references(() => customsInspections.id, { onDelete: 'cascade' }),
  // Entry item reference (if applicable)
  entryItemId: text('entry_item_id'),

  // What was found
  declaredQuantity: numeric('declared_quantity', { precision: 16, scale: 4 }),
  foundQuantity: numeric('found_quantity', { precision: 16, scale: 4 }),
  declaredTariffFraction: text('declared_tariff_fraction'),
  foundTariffFraction: text('found_tariff_fraction'),

  description: text('description'),
  discrepancyType: text('discrepancy_type'),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
