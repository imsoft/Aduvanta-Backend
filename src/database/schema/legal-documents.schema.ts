import { pgTable, text, date, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const legalDocumentTypeEnum = pgEnum('legal_document_type', [
  'LAW',
  'REGULATION',
  'DECREE',
  'AGREEMENT',
  'CIRCULAR',
  'GENERAL_RULES',
  'EXPLANATORY_NOTES',
  'MANUAL',
  'NOM',
  'OTHER',
]);

// Legal reference library — laws, regulations, decrees, agreements, NOMs, manuals
export const legalDocuments = pgTable('legal_documents', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  type: legalDocumentTypeEnum('type').notNull(),
  // Official identifier (e.g., "DOF-15-06-2023", "Ley Aduanera")
  code: text('code').notNull(),
  title: text('title').notNull(),
  // Issuing authority (e.g., "Congreso de la Unión", "SE", "SAT")
  issuingAuthority: text('issuing_authority'),
  publicationDate: date('publication_date'),
  effectiveDate: date('effective_date'),
  // URL or path to full text (if available)
  sourceUrl: text('source_url'),
  summary: text('summary'),
  // Full text content (for searchable legislation)
  content: text('content'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
