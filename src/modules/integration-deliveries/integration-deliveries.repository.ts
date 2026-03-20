import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, SQL } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  integrationDeliveries,
  type DeliveryStatus,
} from '../../database/schema/index.js';

export type DeliveryRecord = typeof integrationDeliveries.$inferSelect;
export type NewDelivery = typeof integrationDeliveries.$inferInsert;

export interface ListDeliveriesFilter {
  integrationId: string;
  organizationId: string;
  status?: DeliveryStatus;
}

@Injectable()
export class IntegrationDeliveriesRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async insert(entry: NewDelivery): Promise<DeliveryRecord> {
    const [record] = await this.db
      .insert(integrationDeliveries)
      .values(entry)
      .returning();
    return record;
  }

  async findById(id: string): Promise<DeliveryRecord | undefined> {
    const result = await this.db
      .select()
      .from(integrationDeliveries)
      .where(eq(integrationDeliveries.id, id))
      .limit(1);
    return result[0];
  }

  async findByIntegration(
    filter: ListDeliveriesFilter,
  ): Promise<DeliveryRecord[]> {
    const conditions: SQL[] = [
      eq(integrationDeliveries.integrationId, filter.integrationId),
      eq(integrationDeliveries.organizationId, filter.organizationId),
    ];

    if (filter.status) {
      conditions.push(eq(integrationDeliveries.status, filter.status));
    }

    return this.db
      .select()
      .from(integrationDeliveries)
      .where(and(...conditions))
      .orderBy(desc(integrationDeliveries.createdAt))
      .limit(100);
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<NewDelivery>,
  ): Promise<DeliveryRecord | undefined> {
    const result = await this.db
      .update(integrationDeliveries)
      .set(data)
      .where(
        and(
          eq(integrationDeliveries.id, id),
          eq(integrationDeliveries.organizationId, organizationId),
        ),
      )
      .returning();
    return result[0];
  }
}
