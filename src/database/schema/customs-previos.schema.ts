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

export const previoStatusEnum = pgEnum('previo_status', [
  'PENDING', // Requested, not yet started
  'IN_PROGRESS', // Previo in progress
  'COMPLETED', // Previo completed, report ready
  'CANCELLED', // Cancelled
]);

export const previoTypeEnum = pgEnum('previo_type', [
  'FULL', // Full physical count and review
  'PARTIAL', // Partial review
  'SAMPLING', // Sample-based review
]);

// customs_previos — pre-inspection (previo) records
// A previo is the physical verification done by the customs broker before
// presenting the pedimento. The broker counts packages, verifies contents
// against commercial invoice, and documents the actual cargo condition.
export const customsPrevios = pgTable('customs_previos', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  entryId: text('entry_id').references(() => customsEntries.id, {
    onDelete: 'restrict',
  }),
  shipmentId: text('shipment_id').references(() => shipments.id),

  // Reference number assigned by broker for this previo
  previoNumber: text('previo_number').notNull(),
  type: previoTypeEnum('type').notNull().default('FULL'),
  status: previoStatusEnum('status').notNull().default('PENDING'),

  // Warehouse / location where previo is conducted
  warehouseName: text('warehouse_name'),
  warehouseAddress: text('warehouse_address'),
  customsOfficeId: text('customs_office_id'),

  // Date / time
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),

  // Personnel
  inspectorName: text('inspector_name'),
  supervisorName: text('supervisor_name'),

  // Package counts
  declaredPackages: integer('declared_packages'),
  foundPackages: integer('found_packages'),
  packageDiscrepancy: boolean('package_discrepancy').default(false),

  // Weight verification
  declaredGrossWeightKg: numeric('declared_gross_weight_kg', {
    precision: 16,
    scale: 4,
  }),
  foundGrossWeightKg: numeric('found_gross_weight_kg', {
    precision: 16,
    scale: 4,
  }),

  // Container details
  containerNumbers: text('container_numbers'),
  sealNumbers: text('seal_numbers'),
  sealIntact: boolean('seal_intact'),

  // Results
  discrepanciesFound: boolean('discrepancies_found').default(false),
  discrepancyNotes: text('discrepancy_notes'),
  photographsTaken: boolean('photographs_taken').default(false),
  photographCount: integer('photograph_count').default(0),

  // The previo report document
  reportFileKey: text('report_file_key'),

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

// previo_items — individual items verified during previo
export const customsPrevioItems = pgTable('customs_previo_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  previoId: text('previo_id')
    .notNull()
    .references(() => customsPrevios.id, { onDelete: 'cascade' }),
  // Entry item reference
  entryItemId: text('entry_item_id'),
  sequenceNumber: integer('sequence_number').notNull(),

  // Item identification
  tariffFraction: text('tariff_fraction'),
  description: text('description').notNull(),
  brand: text('brand'),
  model: text('model'),
  serialNumbers: text('serial_numbers'),

  // Quantities
  declaredQuantity: numeric('declared_quantity', { precision: 16, scale: 4 }),
  foundQuantity: numeric('found_quantity', { precision: 16, scale: 4 }),
  unitOfMeasure: text('unit_of_measure'),

  // Condition
  goodCondition: boolean('good_condition').default(true),
  damageNotes: text('damage_notes'),

  // Country of origin
  countryOfOrigin: text('country_of_origin'),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
