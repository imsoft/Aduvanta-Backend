import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  date,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema.js';
import { customsEntries } from './customs-entries.schema.js';

export const shipmentStatusEnum = pgEnum('shipment_status', [
  'PENDING', // Awaiting customs processing
  'IN_TRANSIT', // Goods in transit to customs
  'AT_CUSTOMS', // Arrived at customs facility
  'PREVIO', // Pre-inspection / previo
  'DISPATCHING', // In dispatch process (despacho)
  'MODULATION', // At modulation (semáforo fiscal)
  'GREEN_LIGHT', // Passed modulation — no inspection
  'RED_LIGHT', // Selected for physical inspection (reconocimiento)
  'INSPECTION', // Physical inspection in progress
  'RELEASED', // Cleared and released (desaduanamiento)
  'DELIVERED', // Delivered to final destination
  'HELD', // On hold (retenido)
  'CANCELLED',
]);

export const shipmentTypeEnum = pgEnum('shipment_type', [
  'IMPORT',
  'EXPORT',
  'TRANSIT',
]);

// Shipment — represents the physical movement of goods through customs
// Links to one or more customs entries (pedimentos)
export const shipments = pgTable('shipments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  // Primary customs entry associated with this shipment
  primaryEntryId: text('primary_entry_id').references(() => customsEntries.id),
  type: shipmentTypeEnum('type').notNull(),
  status: shipmentStatusEnum('status').notNull().default('PENDING'),
  // Internal tracking reference
  trackingNumber: text('tracking_number').notNull(),
  // Client/importer/exporter reference
  clientReference: text('client_reference'),
  // Client name (denormalized for quick display)
  clientName: text('client_name'),
  clientTaxId: text('client_tax_id'),
  // Description of goods
  goodsDescription: text('goods_description'),
  // Origin and destination
  originCountry: text('origin_country'),
  originCity: text('origin_city'),
  destinationCountry: text('destination_country'),
  destinationCity: text('destination_city'),
  // Transport details
  transportMode: integer('transport_mode'),
  carrierName: text('carrier_name'),
  vesselName: text('vessel_name'),
  voyageNumber: text('voyage_number'),
  billOfLading: text('bill_of_lading'),
  containerNumbers: text('container_numbers'),
  // Cargo details
  totalPackages: integer('total_packages'),
  totalGrossWeightKg: numeric('total_gross_weight_kg', {
    precision: 16,
    scale: 4,
  }),
  totalNetWeightKg: numeric('total_net_weight_kg', {
    precision: 16,
    scale: 4,
  }),
  // Values
  declaredValueUsd: numeric('declared_value_usd', {
    precision: 16,
    scale: 2,
  }),
  // Key dates
  estimatedArrivalDate: date('estimated_arrival_date'),
  actualArrivalDate: date('actual_arrival_date'),
  releaseDate: date('release_date'),
  deliveryDate: date('delivery_date'),
  // Customs office where processed
  customsOfficeId: text('customs_office_id'),
  // Extra metadata (flexible)
  metadata: jsonb('metadata'),
  // Who created/modified
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
