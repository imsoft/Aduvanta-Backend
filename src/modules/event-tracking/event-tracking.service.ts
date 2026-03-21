import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS } from '../../redis/redis.module.js';
import { DATABASE, type Database } from '../../database/database.module.js';
import { productEvents } from '../../database/schema/index.js';
import type { TrackEventInput } from './event-tracking.types.js';

const BUFFER_KEY = 'event_tracking:buffer';
const FLUSH_INTERVAL_MS = 5_000;
const MAX_BATCH_SIZE = 200;
const MAX_BUFFER_SIZE = 10_000;

@Injectable()
export class EventTrackingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventTrackingService.name);
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    @Inject(DATABASE) private readonly db: Database,
  ) {}

  onModuleInit(): void {
    this.flushTimer = setInterval(() => {
      void this.flush();
    }, FLUSH_INTERVAL_MS);

    this.logger.log('Event tracking service started with buffered writes');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    // Final flush on shutdown
    await this.flush();
  }

  async track(event: TrackEventInput): Promise<void> {
    try {
      const serialized = JSON.stringify({
        eventId: event.eventId,
        userId: event.userId ?? null,
        organizationId: event.organizationId ?? null,
        sessionId: event.sessionId ?? null,
        category: event.category,
        eventName: event.eventName,
        properties: event.properties ?? null,
        source: event.source,
        ipAddress: event.ipAddress ?? null,
        userAgent: event.userAgent ?? null,
        referrer: event.referrer ?? null,
        pageUrl: event.pageUrl ?? null,
        numericValue: event.numericValue ?? null,
        occurredAt: event.occurredAt.toISOString(),
      });

      const bufferSize = await this.redis.lpush(BUFFER_KEY, serialized);

      // Flush immediately if buffer is getting large
      if (bufferSize >= MAX_BATCH_SIZE) {
        void this.flush();
      }

      // Safety: drop oldest events if buffer grows beyond limit
      if (bufferSize > MAX_BUFFER_SIZE) {
        await this.redis.ltrim(BUFFER_KEY, 0, MAX_BUFFER_SIZE - 1);
        this.logger.warn(
          { bufferSize },
          'Event buffer exceeded max size, trimmed oldest events',
        );
      }
    } catch (error) {
      // Fail open — never block the request for analytics
      this.logger.warn(
        { error, eventName: event.eventName },
        'Failed to buffer event, dropping silently',
      );
    }
  }

  async trackMany(events: TrackEventInput[]): Promise<void> {
    if (events.length === 0) return;

    try {
      const serialized = events.map((event) =>
        JSON.stringify({
          eventId: event.eventId,
          userId: event.userId ?? null,
          organizationId: event.organizationId ?? null,
          sessionId: event.sessionId ?? null,
          category: event.category,
          eventName: event.eventName,
          properties: event.properties ?? null,
          source: event.source,
          ipAddress: event.ipAddress ?? null,
          userAgent: event.userAgent ?? null,
          referrer: event.referrer ?? null,
          pageUrl: event.pageUrl ?? null,
          numericValue: event.numericValue ?? null,
          occurredAt: event.occurredAt.toISOString(),
        }),
      );

      await this.redis.lpush(BUFFER_KEY, ...serialized);
    } catch (error) {
      this.logger.warn(
        { error, count: events.length },
        'Failed to buffer events batch',
      );
    }
  }

  async flush(): Promise<number> {
    let flushed = 0;

    try {
      // Atomically pop a batch from the buffer
      const batch: string[] = [];
      for (let i = 0; i < MAX_BATCH_SIZE; i++) {
        const item = await this.redis.rpop(BUFFER_KEY);
        if (!item) break;
        batch.push(item);
      }

      if (batch.length === 0) return 0;

      const rows = batch.map((raw) => {
        const e = JSON.parse(raw) as {
          eventId: string;
          userId: string | null;
          organizationId: string | null;
          sessionId: string | null;
          category: string;
          eventName: string;
          properties: Record<string, unknown> | null;
          source: string;
          ipAddress: string | null;
          userAgent: string | null;
          referrer: string | null;
          pageUrl: string | null;
          numericValue: number | null;
          occurredAt: string;
        };

        return {
          eventId: e.eventId,
          userId: e.userId,
          organizationId: e.organizationId,
          sessionId: e.sessionId,
          category: e.category,
          eventName: e.eventName,
          properties: e.properties,
          source: e.source,
          ipAddress: e.ipAddress,
          userAgent: e.userAgent,
          referrer: e.referrer,
          pageUrl: e.pageUrl,
          numericValue: e.numericValue,
          occurredAt: new Date(e.occurredAt),
        };
      });

      // Insert with ON CONFLICT DO NOTHING for deduplication
      await this.db
        .insert(productEvents)
        .values(rows)
        .onConflictDoNothing({ target: productEvents.eventId });

      flushed = rows.length;

      if (flushed > 0) {
        this.logger.debug({ flushed }, 'Flushed events to database');
      }
    } catch (error) {
      this.logger.error({ error }, 'Failed to flush events to database');
    }

    return flushed;
  }
}
