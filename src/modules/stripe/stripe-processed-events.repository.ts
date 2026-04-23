import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { stripeProcessedEvents } from '../../database/schema/index.js';

/**
 * Registers processed Stripe events to guarantee idempotency against Stripe's
 * at-least-once delivery (network timeouts, retries, replay during incidents).
 */
@Injectable()
export class StripeProcessedEventsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  /**
   * Inserts the event id. Returns `true` when the insert succeeded (first
   * time we see this event), `false` when it was already processed.
   */
  async markProcessed(
    eventId: string,
    eventType: string,
  ): Promise<boolean> {
    const result = await this.db
      .insert(stripeProcessedEvents)
      .values({ eventId, eventType })
      .onConflictDoNothing({ target: stripeProcessedEvents.eventId })
      .returning({ eventId: stripeProcessedEvents.eventId });

    return result.length > 0;
  }

  /**
   * Removes the marker so the event can be reprocessed on retry. Use only
   * when the handler failed AFTER `markProcessed` — e.g. to let Stripe retry.
   */
  async unmark(eventId: string): Promise<void> {
    await this.db.execute(
      sql`DELETE FROM stripe_processed_events WHERE event_id = ${eventId}`,
    );
  }
}
