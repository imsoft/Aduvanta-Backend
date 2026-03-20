import { pgTable, text, timestamp, numeric, pgEnum } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema.js';
import { warehouses } from './warehouses.schema.js';
import { warehouseInventory } from './warehouse-inventory.schema.js';

export const movementDirectionEnum = pgEnum('warehouse_movement_direction', [
  'INBOUND', // Entrada
  'OUTBOUND', // Salida
  'INTERNAL_TRANSFER', // Transferencia interna
  'ADJUSTMENT', // Ajuste de inventario
]);

export const warehouseMovementStatusEnum = pgEnum('warehouse_movement_status', [
  'PENDING', // Pendiente
  'IN_PROCESS', // En proceso
  'COMPLETED', // Completado
  'CANCELLED', // Cancelado
]);

export const warehouseMovements = pgTable('warehouse_movements', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  warehouseId: text('warehouse_id')
    .notNull()
    .references(() => warehouses.id),
  inventoryItemId: text('inventory_item_id').references(
    () => warehouseInventory.id,
  ),
  direction: movementDirectionEnum('direction').notNull(),
  status: warehouseMovementStatusEnum('status').notNull().default('PENDING'),
  referenceNumber: text('reference_number'),
  entryId: text('entry_id'),
  shipmentId: text('shipment_id'),
  clientId: text('client_id'),
  productDescription: text('product_description').notNull(),
  quantity: numeric('quantity', { precision: 14, scale: 4 }).notNull(),
  unitOfMeasure: text('unit_of_measure').notNull(),
  weightKg: numeric('weight_kg', { precision: 14, scale: 4 }),
  fromZoneId: text('from_zone_id'),
  toZoneId: text('to_zone_id'),
  carrierName: text('carrier_name'),
  vehiclePlate: text('vehicle_plate'),
  driverName: text('driver_name'),
  sealNumber: text('seal_number'),
  pedimentoNumber: text('pedimento_number'),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  completedById: text('completed_by_id'),
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
