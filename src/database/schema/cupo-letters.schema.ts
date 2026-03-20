import {
  pgTable,
  text,
  timestamp,
  numeric,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema.js';

export const cupoLetterStatusEnum = pgEnum('cupo_letter_status', [
  'DRAFT', // Borrador
  'SUBMITTED', // Enviada a SE
  'APPROVED', // Aprobada
  'PARTIALLY_USED', // Parcialmente utilizada
  'FULLY_USED', // Totalmente utilizada
  'EXPIRED', // Vencida
  'REJECTED', // Rechazada
  'CANCELLED', // Cancelada
]);

export const cupoLetterTypeEnum = pgEnum('cupo_letter_type', [
  'TARIFF_RATE_QUOTA', // Cupo arancelario (TRQ)
  'NON_TARIFF_QUOTA', // Cupo no arancelario
  'TRADE_AGREEMENT', // Cupo por tratado comercial
  'SPECIAL_PROGRAM', // Programa especial (PROSEC, etc.)
  'SEASONAL', // Cupo estacional
]);

export const cupoLetters = pgTable('cupo_letters', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  type: cupoLetterTypeEnum('type').notNull(),
  status: cupoLetterStatusEnum('status').notNull().default('DRAFT'),
  letterNumber: text('letter_number'),
  folio: text('folio'),
  clientId: text('client_id'),
  importerRfc: text('importer_rfc'),
  importerName: text('importer_name'),
  tariffFraction: text('tariff_fraction'),
  productDescription: text('product_description').notNull(),
  countryOfOrigin: text('country_of_origin'),
  tradeAgreement: text('trade_agreement'),
  authorizedQuantity: numeric('authorized_quantity', {
    precision: 18,
    scale: 4,
  }).notNull(),
  usedQuantity: numeric('used_quantity', {
    precision: 18,
    scale: 4,
  })
    .notNull()
    .default('0'),
  remainingQuantity: numeric('remaining_quantity', {
    precision: 18,
    scale: 4,
  })
    .notNull()
    .default('0'),
  unitOfMeasure: text('unit_of_measure').notNull(),
  preferentialTariffRate: numeric('preferential_tariff_rate', {
    precision: 8,
    scale: 4,
  }),
  normalTariffRate: numeric('normal_tariff_rate', {
    precision: 8,
    scale: 4,
  }),
  issuingAuthority: text('issuing_authority'),
  issueDate: timestamp('issue_date', { withTimezone: true }),
  effectiveDate: timestamp('effective_date', { withTimezone: true }),
  expirationDate: timestamp('expiration_date', { withTimezone: true }),
  seReferenceNumber: text('se_reference_number'),
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
