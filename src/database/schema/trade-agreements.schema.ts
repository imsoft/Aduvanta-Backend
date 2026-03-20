import { pgTable, text, date, timestamp } from 'drizzle-orm/pg-core';

// International trade agreements (TLCs, ACEs, ALADI, etc.)
export const tradeAgreements = pgTable('trade_agreements', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  // Short code (e.g., "T-MEC", "TLCUE", "ACE-55", "ALADI")
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  // Partner countries or blocs (stored as comma-separated or descriptive text)
  partnerCountries: text('partner_countries').notNull(),
  effectiveDate: date('effective_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
