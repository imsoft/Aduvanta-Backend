import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { tariffFractions } from './tariff-fractions.schema.js';

export const regulationTypeEnum = pgEnum('regulation_type', [
  // Non-tariff regulations and restrictions (RRNA)
  'NOM',
  'PRIOR_PERMIT',
  'PHYTOSANITARY',
  'ZOOSANITARY',
  'ENVIRONMENTAL',
  'ENERGY',
  'SAFETY',
  'LABELING',
  'QUOTA',
  'OTHER',
]);

export const tradeFlowEnum = pgEnum('trade_flow', ['IMPORT', 'EXPORT', 'BOTH']);

// Regulations and restrictions linked to tariff fractions (RRNA)
export const tariffRegulations = pgTable('tariff_regulations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  fractionId: text('fraction_id')
    .notNull()
    .references(() => tariffFractions.id),
  type: regulationTypeEnum('type').notNull(),
  tradeFlow: tradeFlowEnum('trade_flow').notNull(),
  // Official regulation identifier (e.g., "NOM-051-SCFI/SSA1-2010")
  code: text('code').notNull(),
  description: text('description').notNull(),
  // Issuing authority (e.g., SE, SEMARNAT, SENASICA, COFEPRIS)
  issuingAuthority: text('issuing_authority'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
