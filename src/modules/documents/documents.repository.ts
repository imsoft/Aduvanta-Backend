import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt, ilike, SQL } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  documents,
  documentVersions,
  type DocumentStatus,
} from '../../database/schema/index.js';

export type DocumentRecord = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type DocumentVersionRecord = typeof documentVersions.$inferSelect;
export type NewDocumentVersion = typeof documentVersions.$inferInsert;

export interface ListDocumentsFilter {
  operationId: string;
  organizationId: string;
  search?: string;
  categoryId?: string;
  status?: DocumentStatus;
  limit: number;
  offset: number;
}

@Injectable()
export class DocumentsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async insert(entry: NewDocument): Promise<DocumentRecord> {
    const [record] = await this.db.insert(documents).values(entry).returning();
    return record;
  }

  async findById(id: string): Promise<DocumentRecord | undefined> {
    const result = await this.db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);
    return result[0];
  }

  async findByOperation(filter: ListDocumentsFilter): Promise<DocumentRecord[]> {
    const conditions: SQL[] = [
      eq(documents.operationId, filter.operationId),
      eq(documents.organizationId, filter.organizationId),
    ];

    if (filter.categoryId) {
      conditions.push(eq(documents.categoryId, filter.categoryId));
    }

    if (filter.status) {
      conditions.push(eq(documents.status, filter.status));
    }

    if (filter.search) {
      conditions.push(ilike(documents.name, `%${filter.search}%`));
    }

    return this.db
      .select()
      .from(documents)
      .where(and(...conditions))
      .limit(filter.limit)
      .offset(filter.offset);
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<NewDocument>,
  ): Promise<DocumentRecord | undefined> {
    const result = await this.db
      .update(documents)
      .set(data)
      .where(and(eq(documents.id, id), eq(documents.organizationId, organizationId)))
      .returning();
    return result[0];
  }

  async hasDocumentsWithCategory(
    categoryId: string,
    organizationId: string,
  ): Promise<boolean> {
    const result = await this.db
      .select({ id: documents.id })
      .from(documents)
      .where(
        and(
          eq(documents.categoryId, categoryId),
          eq(documents.organizationId, organizationId),
        ),
      )
      .limit(1);
    return result.length > 0;
  }

  async insertVersion(entry: NewDocumentVersion): Promise<DocumentVersionRecord> {
    const [record] = await this.db
      .insert(documentVersions)
      .values(entry)
      .returning();
    return record;
  }

  async findVersionsByDocument(
    documentId: string,
    organizationId: string,
  ): Promise<DocumentVersionRecord[]> {
    return this.db
      .select()
      .from(documentVersions)
      .where(
        and(
          eq(documentVersions.documentId, documentId),
          eq(documentVersions.organizationId, organizationId),
        ),
      )
      .orderBy(documentVersions.versionNumber);
  }
}
