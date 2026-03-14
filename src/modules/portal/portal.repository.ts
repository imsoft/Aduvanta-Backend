import { Inject, Injectable } from '@nestjs/common';
import { and, eq, ilike, inArray, or, SQL } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  documents,
  operationComments,
  operations,
  type OperationStatus,
} from '../../database/schema/index.js';
import type { OperationRecord } from '../operations/operations.repository.js';
import type { OperationCommentRecord } from '../operation-comments/operation-comments.repository.js';
import type { DocumentRecord } from '../documents/documents.repository.js';

export interface PortalListOperationsFilter {
  organizationId: string;
  clientIds: string[];
  search?: string;
  status?: OperationStatus;
  limit: number;
  offset: number;
}

@Injectable()
export class PortalRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findOperations(filter: PortalListOperationsFilter): Promise<OperationRecord[]> {
    if (filter.clientIds.length === 0) {
      return [];
    }

    const conditions: SQL[] = [
      eq(operations.organizationId, filter.organizationId),
      inArray(operations.clientId, filter.clientIds),
    ];

    if (filter.status) {
      conditions.push(eq(operations.status, filter.status));
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

  async findOperationById(
    operationId: string,
    organizationId: string,
    clientIds: string[],
  ): Promise<OperationRecord | undefined> {
    if (clientIds.length === 0) {
      return undefined;
    }

    const result = await this.db
      .select()
      .from(operations)
      .where(
        and(
          eq(operations.id, operationId),
          eq(operations.organizationId, organizationId),
          inArray(operations.clientId, clientIds),
        ),
      )
      .limit(1);

    return result[0];
  }

  async findClientVisibleComments(
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
          eq(operationComments.isClientVisible, true),
        ),
      )
      .orderBy(operationComments.createdAt);
  }

  async findClientVisibleDocuments(
    operationId: string,
    organizationId: string,
  ): Promise<DocumentRecord[]> {
    return this.db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.operationId, operationId),
          eq(documents.organizationId, organizationId),
          eq(documents.isClientVisible, true),
          eq(documents.status, 'ACTIVE'),
        ),
      );
  }

  async findDocumentById(
    documentId: string,
    organizationId: string,
  ): Promise<DocumentRecord | undefined> {
    const result = await this.db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.id, documentId),
          eq(documents.organizationId, organizationId),
          eq(documents.isClientVisible, true),
          eq(documents.status, 'ACTIVE'),
        ),
      )
      .limit(1);

    return result[0];
  }
}
