import { Inject, Injectable } from '@nestjs/common';
import { and, eq, ilike, or, SQL } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  operations,
  operationStatusHistory,
  type OperationStatus,
  type OperationPriority,
} from '../../database/schema/index.js';

export type OperationRecord = typeof operations.$inferSelect;
export type NewOperation = typeof operations.$inferInsert;
export type OperationStatusHistoryRecord = typeof operationStatusHistory.$inferSelect;
export type NewOperationStatusHistory = typeof operationStatusHistory.$inferInsert;

export interface ListOperationsFilter {
  organizationId: string;
  search?: string;
  clientId?: string;
  status?: OperationStatus;
  priority?: OperationPriority;
  assignedUserId?: string;
  limit: number;
  offset: number;
}

@Injectable()
export class OperationsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async insert(entry: NewOperation): Promise<OperationRecord> {
    const [record] = await this.db.insert(operations).values(entry).returning();
    return record;
  }

  async findById(id: string): Promise<OperationRecord | undefined> {
    const result = await this.db
      .select()
      .from(operations)
      .where(eq(operations.id, id))
      .limit(1);
    return result[0];
  }

  async findByOrganization(filter: ListOperationsFilter): Promise<OperationRecord[]> {
    const conditions: SQL[] = [eq(operations.organizationId, filter.organizationId)];

    if (filter.clientId) {
      conditions.push(eq(operations.clientId, filter.clientId));
    }

    if (filter.status) {
      conditions.push(eq(operations.status, filter.status));
    }

    if (filter.priority) {
      conditions.push(eq(operations.priority, filter.priority));
    }

    if (filter.assignedUserId) {
      conditions.push(eq(operations.assignedUserId, filter.assignedUserId));
    }

    if (filter.search) {
      const term = `%${filter.search}%`;
      conditions.push(
        or(
          ilike(operations.reference, term),
          ilike(operations.title, term),
        ) as SQL,
      );
    }

    return this.db
      .select()
      .from(operations)
      .where(and(...conditions))
      .limit(filter.limit)
      .offset(filter.offset);
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<NewOperation>,
  ): Promise<OperationRecord | undefined> {
    const result = await this.db
      .update(operations)
      .set(data)
      .where(and(eq(operations.id, id), eq(operations.organizationId, organizationId)))
      .returning();
    return result[0];
  }

  async insertStatusHistory(
    entry: NewOperationStatusHistory,
  ): Promise<OperationStatusHistoryRecord> {
    const [record] = await this.db
      .insert(operationStatusHistory)
      .values(entry)
      .returning();
    return record;
  }

  async findStatusHistory(
    operationId: string,
    organizationId: string,
  ): Promise<OperationStatusHistoryRecord[]> {
    return this.db
      .select()
      .from(operationStatusHistory)
      .where(
        and(
          eq(operationStatusHistory.operationId, operationId),
          eq(operationStatusHistory.organizationId, organizationId),
        ),
      )
      .orderBy(operationStatusHistory.createdAt);
  }
}
