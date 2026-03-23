import { pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { tariffFractions } from './tariff-fractions.schema';
import { tradeAgreements } from './trade-agreements.schema';

// Preferential tariff rates per fraction under specific trade agreements
export const tariffAgreementPreferences = pgTable(
  'tariff_agreement_preferences',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    fractionId: text('fraction_id')
      .notNull()
      .references(() => tariffFractions.id),
    agreementId: text('agreement_id')
      .notNull()
      .references(() => tradeAgreements.id),
    // Preferential import rate (e.g., "0%", "5%", "Ex.")
    preferentialRate: text('preferential_rate').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique('uq_fraction_agreement').on(table.fractionId, table.agreementId),
  ],
);
