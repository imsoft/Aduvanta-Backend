import {
  pgTable,
  text,
  timestamp,
  numeric,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { warehouses } from './warehouses.schema';
import { warehouseZones } from './warehouse-zones.schema';

export const inventoryStatusEnum = pgEnum('warehouse_inventory_status', [
  'IN_STOCK', // En existencia
  'RESERVED', // Reservado para despacho
  'IN_TRANSIT', // En tránsito
  'PENDING_INSPECTION', // Pendiente de reconocimiento
  'HELD_BY_CUSTOMS', // Retenido por aduana
  'RELEASED', // Liberado / despachado
  'DAMAGED', // Dañado
  'RETURNED', // Devuelto
]);

export const warehouseInventory = pgTable('warehouse_inventory', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  warehouseId: text('warehouse_id')
    .notNull()
    .references(() => warehouses.id),
  zoneId: text('zone_id').references(() => warehouseZones.id),
  entryId: text('entry_id'),
  shipmentId: text('shipment_id'),
  clientId: text('client_id'),
  sku: text('sku'),
  productDescription: text('product_description').notNull(),
  tariffFraction: text('tariff_fraction'),
  lotNumber: text('lot_number'),
  serialNumber: text('serial_number'),
  quantity: numeric('quantity', { precision: 14, scale: 4 }).notNull(),
  unitOfMeasure: text('unit_of_measure').notNull(),
  weightKg: numeric('weight_kg', { precision: 14, scale: 4 }),
  volumeM3: numeric('volume_m3', { precision: 14, scale: 4 }),
  declaredValueUsd: numeric('declared_value_usd', {
    precision: 18,
    scale: 2,
  }),
  countryOfOrigin: text('country_of_origin'),
  status: inventoryStatusEnum('status').notNull().default('IN_STOCK'),
  pedimentoNumber: text('pedimento_number'),
  entryDate: timestamp('entry_date', { withTimezone: true }),
  expirationDate: timestamp('expiration_date', { withTimezone: true }),
  maxStorageDays: integer('max_storage_days'),
  observations: text('observations'),
  createdById: text('created_by_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
