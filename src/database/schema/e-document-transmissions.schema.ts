import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { eDocuments } from './e-documents.schema';

export const transmissionStatusEnum = pgEnum('transmission_status', [
  'PENDING',
  'SENT',
  'ACKNOWLEDGED',
  'ACCEPTED',
  'REJECTED',
  'ERROR',
]);

// Transmission history for COVE submissions to VUCEM / SAT
export const eDocumentTransmissions = pgTable('e_document_transmissions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eDocumentId: text('e_document_id')
    .notNull()
    .references(() => eDocuments.id, { onDelete: 'cascade' }),
  status: transmissionStatusEnum('status').notNull().default('PENDING'),
  // VUCEM transaction ID
  transactionId: text('transaction_id'),
  // Request payload sent (XML/JSON stored as text)
  requestPayload: text('request_payload'),
  // Response received
  responsePayload: text('response_payload'),
  responseCode: text('response_code'),
  responseMessage: text('response_message'),
  // Timing
  sentAt: timestamp('sent_at', { withTimezone: true }),
  respondedAt: timestamp('responded_at', { withTimezone: true }),
  // Who triggered the transmission
  triggeredById: text('triggered_by_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
