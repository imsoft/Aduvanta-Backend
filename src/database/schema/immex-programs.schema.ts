import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  date,
  boolean,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema.js';
import { clients } from './clients.schema.js';

export const immexProgramTypeEnum = pgEnum('immex_program_type', [
  'MANUFACTURERA', // Traditional manufacturing
  'MAQUILADORA', // Maquiladora (assembly)
  'SERVICIOS', // Services
  'ALBERGUE', // Shelter
  'CONTROLADORA', // Holding company
]);

export const immexProgramStatusEnum = pgEnum('immex_program_status', [
  'ACTIVE',
  'SUSPENDED',
  'CANCELLED',
  'EXPIRED',
  'IN_RENOVATION',
]);

export const immexOperationTypeEnum = pgEnum('immex_operation_type', [
  'IMPORT_TEMPORAL', // Temporary import under IMMEX
  'EXPORT_VIRTUAL', // Virtual export between IMMEX companies
  'TRANSFER', // Transfer between IMMEX companies
  'DEFINITIVE_CHANGE', // Change to definitive import
  'RETURN', // Return to origin
]);

// immex_programs — IMMEX manufacturing program records
// IMMEX (Industria Manufacturera, Maquiladora y de Servicios de Exportación)
// authorizes companies to temporarily import goods for manufacturing/processing
export const immexPrograms = pgTable('immex_programs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'restrict' }),

  programNumber: text('program_number').notNull(),
  programType: immexProgramTypeEnum('program_type').notNull(),
  status: immexProgramStatusEnum('status').notNull().default('ACTIVE'),

  // Company info
  rfc: text('rfc').notNull(),
  businessName: text('business_name').notNull(),

  // SE (Secretaría de Economía) authorization
  authorizationDate: date('authorization_date'),
  expirationDate: date('expiration_date'),
  lastRenovationDate: date('last_renovation_date'),
  nextRenovationDate: date('next_renovation_date'),

  // Export commitment (valor mínimo de exportación)
  annualExportCommitmentUsd: numeric('annual_export_commitment_usd', {
    precision: 16,
    scale: 2,
  }),
  lastYearExportsUsd: numeric('last_year_exports_usd', {
    precision: 16,
    scale: 2,
  }),

  // Alert settings
  renovationAlertDays: integer('renovation_alert_days').default(90),
  alertSent: boolean('alert_sent').default(false),

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

// immex_authorized_products — tariff fractions authorized for temporary import
export const immexAuthorizedProducts = pgTable('immex_authorized_products', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  programId: text('program_id')
    .notNull()
    .references(() => immexPrograms.id, { onDelete: 'cascade' }),

  tariffFraction: text('tariff_fraction').notNull(),
  description: text('description').notNull(),
  unitOfMeasure: text('unit_of_measure'),

  // Annual quantity authorized
  authorizedQuantity: numeric('authorized_quantity', {
    precision: 16,
    scale: 4,
  }),
  authorizedValueUsd: numeric('authorized_value_usd', {
    precision: 16,
    scale: 2,
  }),

  isActive: boolean('is_active').notNull().default(true),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// immex_machinery — machinery and equipment authorized under IMMEX
export const immexMachinery = pgTable('immex_machinery', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  programId: text('program_id')
    .notNull()
    .references(() => immexPrograms.id, { onDelete: 'cascade' }),

  tariffFraction: text('tariff_fraction').notNull(),
  description: text('description').notNull(),
  brand: text('brand'),
  model: text('model'),
  serialNumber: text('serial_number'),
  quantity: integer('quantity').notNull().default(1),

  // Temporary import entry reference
  entryNumber: text('entry_number'),
  importDate: date('import_date'),

  // Return tracking
  returnDeadline: date('return_deadline'),
  returnedDate: date('returned_date'),
  isReturned: boolean('is_returned').notNull().default(false),

  isActive: boolean('is_active').notNull().default(true),
  internalNotes: text('internal_notes'),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// immex_virtual_operations — virtual transfers between IMMEX companies
export const immexVirtualOperations = pgTable('immex_virtual_operations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),

  operationType: immexOperationTypeEnum('operation_type').notNull(),

  // Sending company
  senderProgramId: text('sender_program_id').references(
    () => immexPrograms.id,
  ),
  senderRfc: text('sender_rfc').notNull(),
  senderBusinessName: text('sender_business_name').notNull(),

  // Receiving company
  receiverProgramId: text('receiver_program_id').references(
    () => immexPrograms.id,
  ),
  receiverRfc: text('receiver_rfc').notNull(),
  receiverBusinessName: text('receiver_business_name').notNull(),

  // Associated pedimentos
  virtualPedimentoNumber: text('virtual_pedimento_number'),
  complementaryPedimentoNumber: text('complementary_pedimento_number'),

  operationDate: date('operation_date').notNull(),
  totalValueUsd: numeric('total_value_usd', { precision: 16, scale: 2 }),

  internalNotes: text('internal_notes'),
  metadata: jsonb('metadata'),

  createdById: text('created_by_id').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
