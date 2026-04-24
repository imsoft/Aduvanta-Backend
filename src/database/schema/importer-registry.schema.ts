import {
  pgTable,
  text,
  timestamp,
  date,
  boolean,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema.js';
import { clients } from './clients.schema.js';

export const importerRegistryStatusEnum = pgEnum('importer_registry_status', [
  'ACTIVE', // Currently registered in padrón
  'SUSPENDED', // Suspended by SAT
  'CANCELLED', // Cancelled / removed from padrón
  'PENDING', // Application in process
  'EXPIRED', // Registration expired
]);

export const importerRegistryTypeEnum = pgEnum('importer_registry_type', [
  'GENERAL', // Padrón general de importadores
  'SECTORIAL', // Padrón de importadores de sectores específicos (PISE)
  'BOTH', // Registered in both
]);

// importer_registry — tracks clients' registration in Mexico's Padrón de Importadores
// Required for importing goods into Mexico; managed by SAT
export const importerRegistry = pgTable('importer_registry', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'restrict' }),

  registryType: importerRegistryTypeEnum('registry_type')
    .notNull()
    .default('GENERAL'),
  status: importerRegistryStatusEnum('status').notNull().default('ACTIVE'),

  // RFC must match SAT records
  rfc: text('rfc').notNull(),
  businessName: text('business_name').notNull(),

  // Registration dates
  inscriptionDate: date('inscription_date'),
  expirationDate: date('expiration_date'),
  lastVerificationDate: date('last_verification_date'),

  // SAT reference
  satFolioNumber: text('sat_folio_number'),

  // Suspension/cancellation details
  suspensionReason: text('suspension_reason'),
  suspensionDate: date('suspension_date'),

  // Internal tracking
  internalNotes: text('internal_notes'),
  alertSent: boolean('alert_sent').default(false),
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

// PISE sectors — a client can be registered in multiple specific sectors
export const importerRegistrySectors = pgTable('importer_registry_sectors', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  registryId: text('registry_id')
    .notNull()
    .references(() => importerRegistry.id, { onDelete: 'cascade' }),

  // SAT sector code (e.g., "01" = chemicals, "03" = steel, "06" = textiles)
  sectorCode: text('sector_code').notNull(),
  sectorName: text('sector_name').notNull(),

  inscriptionDate: date('inscription_date'),
  expirationDate: date('expiration_date'),
  status: importerRegistryStatusEnum('status').notNull().default('ACTIVE'),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Exporters registry — same structure for padrón de exportadores
export const exporterRegistryStatusEnum = pgEnum('exporter_registry_status', [
  'ACTIVE',
  'SUSPENDED',
  'CANCELLED',
  'PENDING',
  'EXPIRED',
]);

export const exporterRegistry = pgTable('exporter_registry', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'restrict' }),

  status: exporterRegistryStatusEnum('status').notNull().default('ACTIVE'),
  rfc: text('rfc').notNull(),
  businessName: text('business_name').notNull(),

  inscriptionDate: date('inscription_date'),
  expirationDate: date('expiration_date'),
  lastVerificationDate: date('last_verification_date'),

  satFolioNumber: text('sat_folio_number'),
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
