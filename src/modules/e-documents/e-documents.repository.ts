import { Inject, Injectable } from '@nestjs/common';
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  eDocuments,
  eDocumentItems,
  eDocumentTransmissions,
} from '../../database/schema/index.js';

export type EDocumentRecord = typeof eDocuments.$inferSelect;
export type EDocumentItemRecord = typeof eDocumentItems.$inferSelect;
export type EDocumentTransmissionRecord =
  typeof eDocumentTransmissions.$inferSelect;

@Injectable()
export class EDocumentsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  // --- E-Documents ---

  async findByOrganization(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ eDocuments: EDocumentRecord[]; total: number }> {
    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(eDocuments)
        .where(eq(eDocuments.organizationId, organizationId))
        .orderBy(desc(eDocuments.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(eDocuments)
        .where(eq(eDocuments.organizationId, organizationId)),
    ]);

    return { eDocuments: rows, total: countResult[0].count };
  }

  async findByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<EDocumentRecord | undefined> {
    const result = await this.db
      .select()
      .from(eDocuments)
      .where(
        and(
          eq(eDocuments.id, id),
          eq(eDocuments.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async insert(data: typeof eDocuments.$inferInsert): Promise<EDocumentRecord> {
    const [created] = await this.db.insert(eDocuments).values(data).returning();

    return created;
  }

  async update(
    id: string,
    data: Partial<typeof eDocuments.$inferInsert>,
  ): Promise<EDocumentRecord> {
    const [updated] = await this.db
      .update(eDocuments)
      .set(data)
      .where(eq(eDocuments.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(eDocuments).where(eq(eDocuments.id, id));
  }

  async search(
    organizationId: string,
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ eDocuments: EDocumentRecord[]; total: number }> {
    const pattern = `%${query}%`;

    const whereClause = and(
      eq(eDocuments.organizationId, organizationId),
      or(
        ilike(eDocuments.coveNumber, pattern),
        ilike(eDocuments.documentNumber, pattern),
        ilike(eDocuments.sellerName, pattern),
        ilike(eDocuments.buyerName, pattern),
        ilike(eDocuments.invoiceNumber, pattern),
      ),
    );

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(eDocuments)
        .where(whereClause)
        .orderBy(desc(eDocuments.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(eDocuments)
        .where(whereClause),
    ]);

    return { eDocuments: rows, total: countResult[0].count };
  }

  // --- Items ---

  async findItemsByDocument(
    eDocumentId: string,
  ): Promise<EDocumentItemRecord[]> {
    return this.db
      .select()
      .from(eDocumentItems)
      .where(eq(eDocumentItems.eDocumentId, eDocumentId))
      .orderBy(eDocumentItems.itemNumber);
  }

  async findItemById(id: string): Promise<EDocumentItemRecord | undefined> {
    const result = await this.db
      .select()
      .from(eDocumentItems)
      .where(eq(eDocumentItems.id, id))
      .limit(1);

    return result[0];
  }

  async insertItem(
    data: typeof eDocumentItems.$inferInsert,
  ): Promise<EDocumentItemRecord> {
    const [created] = await this.db
      .insert(eDocumentItems)
      .values(data)
      .returning();

    return created;
  }

  async updateItem(
    id: string,
    data: Partial<typeof eDocumentItems.$inferInsert>,
  ): Promise<EDocumentItemRecord> {
    const [updated] = await this.db
      .update(eDocumentItems)
      .set(data)
      .where(eq(eDocumentItems.id, id))
      .returning();

    return updated;
  }

  async deleteItem(id: string): Promise<void> {
    await this.db.delete(eDocumentItems).where(eq(eDocumentItems.id, id));
  }

  // --- Transmissions ---

  async findTransmissionsByDocument(
    eDocumentId: string,
  ): Promise<EDocumentTransmissionRecord[]> {
    return this.db
      .select()
      .from(eDocumentTransmissions)
      .where(eq(eDocumentTransmissions.eDocumentId, eDocumentId))
      .orderBy(desc(eDocumentTransmissions.createdAt));
  }

  async insertTransmission(
    data: typeof eDocumentTransmissions.$inferInsert,
  ): Promise<EDocumentTransmissionRecord> {
    const [created] = await this.db
      .insert(eDocumentTransmissions)
      .values(data)
      .returning();

    return created;
  }

  async updateTransmission(
    id: string,
    data: Partial<typeof eDocumentTransmissions.$inferInsert>,
  ): Promise<EDocumentTransmissionRecord> {
    const [updated] = await this.db
      .update(eDocumentTransmissions)
      .set(data)
      .where(eq(eDocumentTransmissions.id, id))
      .returning();

    return updated;
  }
}
