import { Inject, Injectable } from '@nestjs/common';
import { and, eq, SQL } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  operationAdvances,
  type OperationAdvanceStatus,
} from '../../database/schema/index.js';

export type OperationAdvanceRecord = typeof operationAdvances.$inferSelect;
export type NewOperationAdvance = typeof operationAdvances.$inferInsert;

export interface ListAdvancesFilter {
  operationId: string;
  organizationId: string;
  status?: OperationAdvanceStatus;
}

@Injectable()
export class OperationAdvancesRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async insert(entry: NewOperationAdvance): Promise<OperationAdvanceRecord> {
    const [record] = await this.db
      .insert(operationAdvances)
      .values(entry)
      .returning();
    return record;
  }

  async findById(id: string): Promise<OperationAdvanceRecord | undefined> {
    const result = await this.db
      .select()
      .from(operationAdvances)
      .where(eq(operationAdvances.id, id))
      .limit(1);
    return result[0];
  }

  async findByOperation(
    filter: ListAdvancesFilter,
  ): Promise<OperationAdvanceRecord[]> {
    const conditions: SQL[] = [
      eq(operationAdvances.operationId, filter.operationId),
      eq(operationAdvances.organizationId, filter.organizationId),
    ];

    if (filter.status) {
      conditions.push(eq(operationAdvances.status, filter.status));
    }

    return this.db
      .select()
      .from(operationAdvances)
      .where(and(...conditions))
      .orderBy(operationAdvances.receivedAt);
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<NewOperationAdvance>,
  ): Promise<OperationAdvanceRecord | undefined> {
    const result = await this.db
      .update(operationAdvances)
      .set(data)
      .where(
        and(
          eq(operationAdvances.id, id),
          eq(operationAdvances.organizationId, organizationId),
        ),
      )
      .returning();
    return result[0];
  }

  async findActiveByOperation(
    operationId: string,
    organizationId: string,
  ): Promise<OperationAdvanceRecord[]> {
    return this.db
      .select()
      .from(operationAdvances)
      .where(
        and(
          eq(operationAdvances.operationId, operationId),
          eq(operationAdvances.organizationId, organizationId),
          eq(operationAdvances.status, 'ACTIVE'),
        ),
      );
  }
}
