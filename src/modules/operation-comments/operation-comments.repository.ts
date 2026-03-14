import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { operationComments } from '../../database/schema/index.js';

export type OperationCommentRecord = typeof operationComments.$inferSelect;
export type NewOperationComment = typeof operationComments.$inferInsert;

@Injectable()
export class OperationCommentsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async insert(entry: NewOperationComment): Promise<OperationCommentRecord> {
    const [record] = await this.db
      .insert(operationComments)
      .values(entry)
      .returning();
    return record;
  }

  async findByOperation(
    operationId: string,
    organizationId: string,
  ): Promise<OperationCommentRecord[]> {
    return this.db
      .select()
      .from(operationComments)
      .where(
        and(
          eq(operationComments.operationId, operationId),
          eq(operationComments.organizationId, organizationId),
        ),
      )
      .orderBy(asc(operationComments.createdAt));
  }
}
