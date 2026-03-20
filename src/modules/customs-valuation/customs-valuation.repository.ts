import { Inject, Injectable } from '@nestjs/common';
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  valuationDeclarations,
  valuationItems,
  valuationCosts,
} from '../../database/schema/index.js';

export type ValuationRecord = typeof valuationDeclarations.$inferSelect;
export type ValuationItemRecord = typeof valuationItems.$inferSelect;
export type ValuationCostRecord = typeof valuationCosts.$inferSelect;

@Injectable()
export class CustomsValuationRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  // --- Declarations ---

  async findDeclarationsByOrganization(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ declarations: ValuationRecord[]; total: number }> {
    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(valuationDeclarations)
        .where(eq(valuationDeclarations.organizationId, organizationId))
        .orderBy(desc(valuationDeclarations.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(valuationDeclarations)
        .where(eq(valuationDeclarations.organizationId, organizationId)),
    ]);

    return { declarations: rows, total: countResult[0].count };
  }

  async findDeclarationByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<ValuationRecord | undefined> {
    const result = await this.db
      .select()
      .from(valuationDeclarations)
      .where(
        and(
          eq(valuationDeclarations.id, id),
          eq(valuationDeclarations.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async insertDeclaration(
    data: typeof valuationDeclarations.$inferInsert,
  ): Promise<ValuationRecord> {
    const [created] = await this.db
      .insert(valuationDeclarations)
      .values(data)
      .returning();

    return created;
  }

  async updateDeclaration(
    id: string,
    data: Partial<typeof valuationDeclarations.$inferInsert>,
  ): Promise<ValuationRecord> {
    const [updated] = await this.db
      .update(valuationDeclarations)
      .set(data)
      .where(eq(valuationDeclarations.id, id))
      .returning();

    return updated;
  }

  async deleteDeclaration(id: string): Promise<void> {
    await this.db
      .delete(valuationDeclarations)
      .where(eq(valuationDeclarations.id, id));
  }

  async searchDeclarations(
    organizationId: string,
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ declarations: ValuationRecord[]; total: number }> {
    const pattern = `%${query}%`;

    const whereClause = and(
      eq(valuationDeclarations.organizationId, organizationId),
      or(
        ilike(valuationDeclarations.declarationNumber, pattern),
        ilike(valuationDeclarations.supplierName, pattern),
        ilike(valuationDeclarations.buyerName, pattern),
        ilike(valuationDeclarations.invoiceNumber, pattern),
      ),
    );

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(valuationDeclarations)
        .where(whereClause)
        .orderBy(desc(valuationDeclarations.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(valuationDeclarations)
        .where(whereClause),
    ]);

    return { declarations: rows, total: countResult[0].count };
  }

  // --- Items ---

  async findItemsByDeclaration(
    declarationId: string,
  ): Promise<ValuationItemRecord[]> {
    return this.db
      .select()
      .from(valuationItems)
      .where(eq(valuationItems.declarationId, declarationId))
      .orderBy(valuationItems.itemNumber);
  }

  async findItemById(id: string): Promise<ValuationItemRecord | undefined> {
    const result = await this.db
      .select()
      .from(valuationItems)
      .where(eq(valuationItems.id, id))
      .limit(1);

    return result[0];
  }

  async insertItem(
    data: typeof valuationItems.$inferInsert,
  ): Promise<ValuationItemRecord> {
    const [created] = await this.db
      .insert(valuationItems)
      .values(data)
      .returning();

    return created;
  }

  async updateItem(
    id: string,
    data: Partial<typeof valuationItems.$inferInsert>,
  ): Promise<ValuationItemRecord> {
    const [updated] = await this.db
      .update(valuationItems)
      .set(data)
      .where(eq(valuationItems.id, id))
      .returning();

    return updated;
  }

  async deleteItem(id: string): Promise<void> {
    await this.db.delete(valuationItems).where(eq(valuationItems.id, id));
  }

  // --- Costs ---

  async findCostsByDeclaration(
    declarationId: string,
  ): Promise<ValuationCostRecord[]> {
    return this.db
      .select()
      .from(valuationCosts)
      .where(eq(valuationCosts.declarationId, declarationId))
      .orderBy(valuationCosts.category, valuationCosts.type);
  }

  async findCostById(id: string): Promise<ValuationCostRecord | undefined> {
    const result = await this.db
      .select()
      .from(valuationCosts)
      .where(eq(valuationCosts.id, id))
      .limit(1);

    return result[0];
  }

  async insertCost(
    data: typeof valuationCosts.$inferInsert,
  ): Promise<ValuationCostRecord> {
    const [created] = await this.db
      .insert(valuationCosts)
      .values(data)
      .returning();

    return created;
  }

  async updateCost(
    id: string,
    data: Partial<typeof valuationCosts.$inferInsert>,
  ): Promise<ValuationCostRecord> {
    const [updated] = await this.db
      .update(valuationCosts)
      .set(data)
      .where(eq(valuationCosts.id, id))
      .returning();

    return updated;
  }

  async deleteCost(id: string): Promise<void> {
    await this.db.delete(valuationCosts).where(eq(valuationCosts.id, id));
  }
}
