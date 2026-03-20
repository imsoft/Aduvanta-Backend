import { pgTable, text, timestamp, numeric } from 'drizzle-orm/pg-core';
import { cupoLetters } from './cupo-letters.schema.js';

export const cupoLetterUsages = pgTable('cupo_letter_usages', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  cupoLetterId: text('cupo_letter_id')
    .notNull()
    .references(() => cupoLetters.id),
  entryId: text('entry_id'),
  pedimentoNumber: text('pedimento_number'),
  shipmentId: text('shipment_id'),
  quantityUsed: numeric('quantity_used', {
    precision: 18,
    scale: 4,
  }).notNull(),
  unitOfMeasure: text('unit_of_measure').notNull(),
  usageDate: timestamp('usage_date', { withTimezone: true })
    .notNull()
    .defaultNow(),
  observations: text('observations'),
  createdById: text('created_by_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
