import { Inject, Injectable } from '@nestjs/common';
import { eq, and, asc, desc, ilike, or, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  customsEntries,
  customsEntryItems,
  customsEntryItemTaxes,
  customsEntryParties,
  customsEntryDocuments,
  customsEntryStatusHistory,
  customsEntryIdentifiers,
  customsEntryContainers,
  customsOffices,
  customsPatents,
} from '../../database/schema/index.js';

export type CustomsEntryRecord = typeof customsEntries.$inferSelect;
export type CustomsEntryItemRecord = typeof customsEntryItems.$inferSelect;
export type CustomsEntryItemTaxRecord =
  typeof customsEntryItemTaxes.$inferSelect;
export type CustomsEntryPartyRecord = typeof customsEntryParties.$inferSelect;
export type CustomsEntryDocumentRecord =
  typeof customsEntryDocuments.$inferSelect;
export type CustomsEntryStatusHistoryRecord =
  typeof customsEntryStatusHistory.$inferSelect;
export type CustomsEntryIdentifierRecord =
  typeof customsEntryIdentifiers.$inferSelect;
export type CustomsEntryContainerRecord =
  typeof customsEntryContainers.$inferSelect;
export type CustomsOfficeRecord = typeof customsOffices.$inferSelect;
export type CustomsPatentRecord = typeof customsPatents.$inferSelect;

@Injectable()
export class CustomsEntriesRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  // --- Customs Offices ---

  async findAllOffices(): Promise<CustomsOfficeRecord[]> {
    return this.db
      .select()
      .from(customsOffices)
      .orderBy(asc(customsOffices.sortOrder));
  }

  async findOfficeById(id: string): Promise<CustomsOfficeRecord | undefined> {
    const result = await this.db
      .select()
      .from(customsOffices)
      .where(eq(customsOffices.id, id))
      .limit(1);

    return result[0];
  }

  async insertOffice(
    data: typeof customsOffices.$inferInsert,
  ): Promise<CustomsOfficeRecord> {
    const [created] = await this.db
      .insert(customsOffices)
      .values(data)
      .returning();

    return created;
  }

  async updateOffice(
    id: string,
    data: Partial<typeof customsOffices.$inferInsert>,
  ): Promise<CustomsOfficeRecord> {
    const [updated] = await this.db
      .update(customsOffices)
      .set(data)
      .where(eq(customsOffices.id, id))
      .returning();

    return updated;
  }

  async deleteOffice(id: string): Promise<void> {
    await this.db.delete(customsOffices).where(eq(customsOffices.id, id));
  }

  // --- Customs Patents ---

  async findPatentsByOrganization(
    organizationId: string,
  ): Promise<CustomsPatentRecord[]> {
    return this.db
      .select()
      .from(customsPatents)
      .where(eq(customsPatents.organizationId, organizationId));
  }

  async findPatentById(id: string): Promise<CustomsPatentRecord | undefined> {
    const result = await this.db
      .select()
      .from(customsPatents)
      .where(eq(customsPatents.id, id))
      .limit(1);

    return result[0];
  }

  async insertPatent(
    data: typeof customsPatents.$inferInsert,
  ): Promise<CustomsPatentRecord> {
    const [created] = await this.db
      .insert(customsPatents)
      .values(data)
      .returning();

    return created;
  }

  async updatePatent(
    id: string,
    data: Partial<typeof customsPatents.$inferInsert>,
  ): Promise<CustomsPatentRecord> {
    const [updated] = await this.db
      .update(customsPatents)
      .set(data)
      .where(eq(customsPatents.id, id))
      .returning();

    return updated;
  }

  async deletePatent(id: string): Promise<void> {
    await this.db.delete(customsPatents).where(eq(customsPatents.id, id));
  }

  // --- Customs Entries ---

  async findEntriesByOrganization(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ entries: CustomsEntryRecord[]; total: number }> {
    const [entries, countResult] = await Promise.all([
      this.db
        .select()
        .from(customsEntries)
        .where(eq(customsEntries.organizationId, organizationId))
        .orderBy(desc(customsEntries.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(customsEntries)
        .where(eq(customsEntries.organizationId, organizationId)),
    ]);

    return { entries, total: countResult[0].count };
  }

  async findEntryById(id: string): Promise<CustomsEntryRecord | undefined> {
    const result = await this.db
      .select()
      .from(customsEntries)
      .where(eq(customsEntries.id, id))
      .limit(1);

    return result[0];
  }

  async findEntryByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<CustomsEntryRecord | undefined> {
    const result = await this.db
      .select()
      .from(customsEntries)
      .where(
        and(
          eq(customsEntries.id, id),
          eq(customsEntries.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async insertEntry(
    data: typeof customsEntries.$inferInsert,
  ): Promise<CustomsEntryRecord> {
    const [created] = await this.db
      .insert(customsEntries)
      .values(data)
      .returning();

    return created;
  }

  async updateEntry(
    id: string,
    data: Partial<typeof customsEntries.$inferInsert>,
  ): Promise<CustomsEntryRecord> {
    const [updated] = await this.db
      .update(customsEntries)
      .set(data)
      .where(eq(customsEntries.id, id))
      .returning();

    return updated;
  }

  async deleteEntry(id: string): Promise<void> {
    await this.db.delete(customsEntries).where(eq(customsEntries.id, id));
  }

  async searchEntries(
    organizationId: string,
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ entries: CustomsEntryRecord[]; total: number }> {
    const pattern = `%${query}%`;

    const whereClause = and(
      eq(customsEntries.organizationId, organizationId),
      or(
        ilike(customsEntries.entryNumber, pattern),
        ilike(customsEntries.internalReference, pattern),
      ),
    );

    const [entries, countResult] = await Promise.all([
      this.db
        .select()
        .from(customsEntries)
        .where(whereClause)
        .orderBy(desc(customsEntries.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(customsEntries)
        .where(whereClause),
    ]);

    return { entries, total: countResult[0].count };
  }

  // --- Entry Items ---

  async findItemsByEntry(entryId: string): Promise<CustomsEntryItemRecord[]> {
    return this.db
      .select()
      .from(customsEntryItems)
      .where(eq(customsEntryItems.entryId, entryId))
      .orderBy(asc(customsEntryItems.itemNumber));
  }

  async findItemById(id: string): Promise<CustomsEntryItemRecord | undefined> {
    const result = await this.db
      .select()
      .from(customsEntryItems)
      .where(eq(customsEntryItems.id, id))
      .limit(1);

    return result[0];
  }

  async insertItem(
    data: typeof customsEntryItems.$inferInsert,
  ): Promise<CustomsEntryItemRecord> {
    const [created] = await this.db
      .insert(customsEntryItems)
      .values(data)
      .returning();

    return created;
  }

  async updateItem(
    id: string,
    data: Partial<typeof customsEntryItems.$inferInsert>,
  ): Promise<CustomsEntryItemRecord> {
    const [updated] = await this.db
      .update(customsEntryItems)
      .set(data)
      .where(eq(customsEntryItems.id, id))
      .returning();

    return updated;
  }

  async deleteItem(id: string): Promise<void> {
    await this.db.delete(customsEntryItems).where(eq(customsEntryItems.id, id));
  }

  // --- Item Taxes ---

  async findTaxesByItem(itemId: string): Promise<CustomsEntryItemTaxRecord[]> {
    return this.db
      .select()
      .from(customsEntryItemTaxes)
      .where(eq(customsEntryItemTaxes.itemId, itemId));
  }

  async insertItemTax(
    data: typeof customsEntryItemTaxes.$inferInsert,
  ): Promise<CustomsEntryItemTaxRecord> {
    const [created] = await this.db
      .insert(customsEntryItemTaxes)
      .values(data)
      .returning();

    return created;
  }

  async deleteItemTaxes(itemId: string): Promise<void> {
    await this.db
      .delete(customsEntryItemTaxes)
      .where(eq(customsEntryItemTaxes.itemId, itemId));
  }

  // --- Entry Parties ---

  async findPartiesByEntry(
    entryId: string,
  ): Promise<CustomsEntryPartyRecord[]> {
    return this.db
      .select()
      .from(customsEntryParties)
      .where(eq(customsEntryParties.entryId, entryId));
  }

  async insertParty(
    data: typeof customsEntryParties.$inferInsert,
  ): Promise<CustomsEntryPartyRecord> {
    const [created] = await this.db
      .insert(customsEntryParties)
      .values(data)
      .returning();

    return created;
  }

  async deleteParty(id: string): Promise<void> {
    await this.db
      .delete(customsEntryParties)
      .where(eq(customsEntryParties.id, id));
  }

  // --- Entry Documents ---

  async findDocumentsByEntry(
    entryId: string,
  ): Promise<CustomsEntryDocumentRecord[]> {
    return this.db
      .select()
      .from(customsEntryDocuments)
      .where(eq(customsEntryDocuments.entryId, entryId));
  }

  async insertDocument(
    data: typeof customsEntryDocuments.$inferInsert,
  ): Promise<CustomsEntryDocumentRecord> {
    const [created] = await this.db
      .insert(customsEntryDocuments)
      .values(data)
      .returning();

    return created;
  }

  async deleteDocument(id: string): Promise<void> {
    await this.db
      .delete(customsEntryDocuments)
      .where(eq(customsEntryDocuments.id, id));
  }

  // --- Status History ---

  async findStatusHistory(
    entryId: string,
  ): Promise<CustomsEntryStatusHistoryRecord[]> {
    return this.db
      .select()
      .from(customsEntryStatusHistory)
      .where(eq(customsEntryStatusHistory.entryId, entryId))
      .orderBy(desc(customsEntryStatusHistory.createdAt));
  }

  async insertStatusHistory(
    data: typeof customsEntryStatusHistory.$inferInsert,
  ): Promise<CustomsEntryStatusHistoryRecord> {
    const [created] = await this.db
      .insert(customsEntryStatusHistory)
      .values(data)
      .returning();

    return created;
  }

  // --- Identifiers ---

  async findIdentifiersByEntry(
    entryId: string,
  ): Promise<CustomsEntryIdentifierRecord[]> {
    return this.db
      .select()
      .from(customsEntryIdentifiers)
      .where(eq(customsEntryIdentifiers.entryId, entryId))
      .orderBy(asc(customsEntryIdentifiers.createdAt));
  }

  async insertIdentifier(
    data: typeof customsEntryIdentifiers.$inferInsert,
  ): Promise<CustomsEntryIdentifierRecord> {
    const [created] = await this.db
      .insert(customsEntryIdentifiers)
      .values(data)
      .returning();

    return created;
  }

  async deleteIdentifier(id: string): Promise<void> {
    await this.db
      .delete(customsEntryIdentifiers)
      .where(eq(customsEntryIdentifiers.id, id));
  }

  // --- Containers ---

  async findContainersByEntry(
    entryId: string,
  ): Promise<CustomsEntryContainerRecord[]> {
    return this.db
      .select()
      .from(customsEntryContainers)
      .where(eq(customsEntryContainers.entryId, entryId))
      .orderBy(asc(customsEntryContainers.createdAt));
  }

  async insertContainer(
    data: typeof customsEntryContainers.$inferInsert,
  ): Promise<CustomsEntryContainerRecord> {
    const [created] = await this.db
      .insert(customsEntryContainers)
      .values(data)
      .returning();

    return created;
  }

  async deleteContainer(id: string): Promise<void> {
    await this.db
      .delete(customsEntryContainers)
      .where(eq(customsEntryContainers.id, id));
  }
}
