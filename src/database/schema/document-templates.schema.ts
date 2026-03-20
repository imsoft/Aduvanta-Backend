import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema.js';

export const templateTypeEnum = pgEnum('template_type', [
  'PEDIMENTO', // Pedimento template
  'COVE', // COVE template
  'VALUATION', // Manifestación de Valor
  'EXPENSE_ACCOUNT', // Cuenta de Gastos
  'INVOICE', // Invoice template
  'POWER_OF_ATTORNEY', // Carta poder / encargo conferido
  'PACKING_LIST', // Lista de empaque
  'COMMERCIAL_INVOICE', // Factura comercial
  'CERTIFICATE_OF_ORIGIN', // Certificado de origen
  'BILL_OF_LADING', // Conocimiento de embarque
  'CUSTOMS_LETTER', // Carta aduanal
  'OTHER',
]);

// Document templates for generating standard customs documents
export const documentTemplates = pgTable('document_templates', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  type: templateTypeEnum('type').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  // Template content (HTML/Handlebars stored as text)
  content: text('content').notNull(),
  // Template variables schema (JSON stored as text)
  variablesSchema: text('variables_schema'),
  // Storage key for template file (if file-based)
  storageKey: text('storage_key'),
  mimeType: text('mime_type'),
  isActive: boolean('is_active').notNull().default(true),
  isDefault: boolean('is_default').notNull().default(false),
  createdById: text('created_by_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
