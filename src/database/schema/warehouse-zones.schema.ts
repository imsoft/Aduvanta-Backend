import {
  pgTable,
  text,
  timestamp,
  boolean,
  numeric,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { warehouses } from './warehouses.schema.js';

export const zoneTypeEnum = pgEnum('warehouse_zone_type', [
  'RECEIVING', // Zona de recepción
  'STORAGE', // Zona de almacenamiento
  'PICKING', // Zona de preparación
  'SHIPPING', // Zona de embarque
  'INSPECTION', // Zona de inspección/reconocimiento
  'QUARANTINE', // Zona de cuarentena
  'HAZMAT', // Materiales peligrosos
  'COLD_STORAGE', // Almacén refrigerado
  'RETURNS', // Zona de devoluciones
]);

export const warehouseZones = pgTable('warehouse_zones', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  warehouseId: text('warehouse_id')
    .notNull()
    .references(() => warehouses.id),
  type: zoneTypeEnum('type').notNull(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  capacityUnits: numeric('capacity_units', { precision: 12, scale: 2 }),
  capacityUnitType: text('capacity_unit_type'),
  isActive: boolean('is_active').notNull().default(true),
  observations: text('observations'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
