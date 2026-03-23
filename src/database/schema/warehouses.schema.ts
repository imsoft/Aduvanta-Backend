import { pgTable, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';

export const warehouseTypeEnum = pgEnum('warehouse_type', [
  'BONDED', // Recinto fiscalizado
  'STRATEGIC_BONDED', // Recinto fiscalizado estratégico
  'GENERAL', // Almacén general de depósito
  'PRIVATE', // Almacén privado
  'TEMPORARY', // Almacén temporal
  'CROSS_DOCK', // Cross-dock
]);

export const warehouses = pgTable('warehouses', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  type: warehouseTypeEnum('type').notNull(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  country: text('country').default('MX'),
  contactName: text('contact_name'),
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  satAuthorizationNumber: text('sat_authorization_number'),
  bondedWarehouseLicense: text('bonded_warehouse_license'),
  isActive: boolean('is_active').notNull().default(true),
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
