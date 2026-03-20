import { Inject, Injectable } from '@nestjs/common';
import { and, eq, SQL } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  operationCharges,
  type OperationChargeStatus,
} from '../../database/schema/index.js';

export type OperationChargeRecord = typeof operationCharges.$inferSelect;
export type NewOperationCharge = typeof operationCharges.$inferInsert;

export interface ListChargesFilter {
  operationId: string;
  organizationId: string;
  status?: OperationChargeStatus;
}

@Injectable()
export class OperationChargesRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async insert(entry: NewOperationCharge): Promise<OperationChargeRecord> {
    const [record] = await this.db
      .insert(operationCharges)
      .values(entry)
      .returning();
    return record;
  }

  async findById(id: string): Promise<OperationChargeRecord | undefined> {
    const result = await this.db
      .select()
      .from(operationCharges)
      .where(eq(operationCharges.id, id))
      .limit(1);
    return result[0];
  }

  async findByOperation(
    filter: ListChargesFilter,
  ): Promise<OperationChargeRecord[]> {
    const conditions: SQL[] = [
      eq(operationCharges.operationId, filter.operationId),
      eq(operationCharges.organizationId, filter.organizationId),
    ];

    if (filter.status) {
      conditions.push(eq(operationCharges.status, filter.status));
    }

    return this.db
      .select()
      .from(operationCharges)
      .where(and(...conditions))
      .orderBy(operationCharges.createdAt);
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<NewOperationCharge>,
  ): Promise<OperationChargeRecord | undefined> {
    const result = await this.db
      .update(operationCharges)
      .set(data)
      .where(
        and(
          eq(operationCharges.id, id),
          eq(operationCharges.organizationId, organizationId),
        ),
      )
      .returning();
    return result[0];
  }

  async findActiveByOperation(
    operationId: string,
    organizationId: string,
  ): Promise<OperationChargeRecord[]> {
    return this.db
      .select()
      .from(operationCharges)
      .where(
        and(
          eq(operationCharges.operationId, operationId),
          eq(operationCharges.organizationId, organizationId),
          eq(operationCharges.status, 'ACTIVE'),
        ),
      );
  }
}
