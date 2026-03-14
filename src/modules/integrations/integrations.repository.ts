import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, SQL } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  integrations,
  type IntegrationStatus,
  type IntegrationProvider,
} from '../../database/schema/index.js';

export type IntegrationRecord = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;

export interface ListIntegrationsFilter {
  organizationId: string;
  status?: IntegrationStatus;
  provider?: IntegrationProvider;
}

@Injectable()
export class IntegrationsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async insert(entry: NewIntegration): Promise<IntegrationRecord> {
    const [record] = await this.db
      .insert(integrations)
      .values(entry)
      .returning();
    return record;
  }

  async findById(id: string): Promise<IntegrationRecord | undefined> {
    const result = await this.db
      .select()
      .from(integrations)
      .where(eq(integrations.id, id))
      .limit(1);
    return result[0];
  }

  async findByOrganization(filter: ListIntegrationsFilter): Promise<IntegrationRecord[]> {
    const conditions: SQL[] = [eq(integrations.organizationId, filter.organizationId)];

    if (filter.status) {
      conditions.push(eq(integrations.status, filter.status));
    }

    if (filter.provider) {
      conditions.push(eq(integrations.provider, filter.provider));
    }

    return this.db
      .select()
      .from(integrations)
      .where(and(...conditions))
      .orderBy(desc(integrations.createdAt));
  }

  async findActiveByOrganizationAndEventType(
    organizationId: string,
    eventType: string,
  ): Promise<IntegrationRecord[]> {
    // Fetch all active integrations and filter by eventTypes in memory.
    // The eventTypes column stores a comma-separated list.
    const active = await this.db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.organizationId, organizationId),
          eq(integrations.status, 'ACTIVE'),
        ),
      );

    return active.filter((i) =>
      i.eventTypes.split(',').map((e) => e.trim()).includes(eventType),
    );
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<NewIntegration>,
  ): Promise<IntegrationRecord | undefined> {
    const result = await this.db
      .update(integrations)
      .set(data)
      .where(and(eq(integrations.id, id), eq(integrations.organizationId, organizationId)))
      .returning();
    return result[0];
  }
}
