import { Inject, Injectable } from '@nestjs/common';
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { cupoLetters, cupoLetterUsages } from '../../database/schema/index.js';

export type CupoLetterRecord = typeof cupoLetters.$inferSelect;
export type CupoLetterUsageRecord = typeof cupoLetterUsages.$inferSelect;

@Injectable()
export class CupoLettersRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  // --- CUPO Letters ---

  async findByOrganization(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ letters: CupoLetterRecord[]; total: number }> {
    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(cupoLetters)
        .where(eq(cupoLetters.organizationId, organizationId))
        .orderBy(desc(cupoLetters.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(cupoLetters)
        .where(eq(cupoLetters.organizationId, organizationId)),
    ]);

    return { letters: rows, total: countResult[0].count };
  }

  async search(
    organizationId: string,
    query: string,
    status: string | undefined,
    type: string | undefined,
    limit: number,
    offset: number,
  ): Promise<{ letters: CupoLetterRecord[]; total: number }> {
    const conditions = [
      eq(cupoLetters.organizationId, organizationId),
      or(
        ilike(cupoLetters.letterNumber, `%${query}%`),
        ilike(cupoLetters.folio, `%${query}%`),
        ilike(cupoLetters.productDescription, `%${query}%`),
        ilike(cupoLetters.importerName, `%${query}%`),
        ilike(cupoLetters.importerRfc, `%${query}%`),
        ilike(cupoLetters.tariffFraction, `%${query}%`),
      ),
    ];

    if (status) {
      conditions.push(eq(cupoLetters.status, status as 'DRAFT'));
    }
    if (type) {
      conditions.push(eq(cupoLetters.type, type as 'TARIFF_RATE_QUOTA'));
    }

    const where = and(...conditions);

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(cupoLetters)
        .where(where)
        .orderBy(desc(cupoLetters.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(cupoLetters)
        .where(where),
    ]);

    return { letters: rows, total: countResult[0].count };
  }

  async findByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<CupoLetterRecord | undefined> {
    const result = await this.db
      .select()
      .from(cupoLetters)
      .where(
        and(
          eq(cupoLetters.id, id),
          eq(cupoLetters.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async insertCupoLetter(
    data: typeof cupoLetters.$inferInsert,
  ): Promise<CupoLetterRecord> {
    const [created] = await this.db
      .insert(cupoLetters)
      .values(data)
      .returning();

    return created;
  }

  async updateCupoLetter(
    id: string,
    data: Partial<typeof cupoLetters.$inferInsert>,
  ): Promise<CupoLetterRecord> {
    const [updated] = await this.db
      .update(cupoLetters)
      .set(data)
      .where(eq(cupoLetters.id, id))
      .returning();

    return updated;
  }

  async deleteCupoLetter(id: string): Promise<void> {
    await this.db.delete(cupoLetters).where(eq(cupoLetters.id, id));
  }

  // --- Usages ---

  async findUsagesByCupoLetter(
    cupoLetterId: string,
  ): Promise<CupoLetterUsageRecord[]> {
    return this.db
      .select()
      .from(cupoLetterUsages)
      .where(eq(cupoLetterUsages.cupoLetterId, cupoLetterId))
      .orderBy(desc(cupoLetterUsages.usageDate));
  }

  async findUsageById(id: string): Promise<CupoLetterUsageRecord | undefined> {
    const result = await this.db
      .select()
      .from(cupoLetterUsages)
      .where(eq(cupoLetterUsages.id, id))
      .limit(1);

    return result[0];
  }

  async insertUsage(
    data: typeof cupoLetterUsages.$inferInsert,
  ): Promise<CupoLetterUsageRecord> {
    const [created] = await this.db
      .insert(cupoLetterUsages)
      .values(data)
      .returning();

    return created;
  }

  async deleteUsage(id: string): Promise<void> {
    await this.db.delete(cupoLetterUsages).where(eq(cupoLetterUsages.id, id));
  }
}
