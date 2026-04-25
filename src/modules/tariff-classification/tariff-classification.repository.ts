import { Inject, Injectable } from '@nestjs/common';
import { eq, ilike, or, asc, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  tariffSections,
  tariffChapters,
  tariffHeadings,
  tariffSubheadings,
  tariffFractions,
  tariffRegulations,
  tariffAgreementPreferences,
  tradeAgreements,
  customsOffices,
} from '../../database/schema/index.js';

export type TariffSectionRecord = typeof tariffSections.$inferSelect;
export type TariffChapterRecord = typeof tariffChapters.$inferSelect;
export type TariffHeadingRecord = typeof tariffHeadings.$inferSelect;
export type TariffSubheadingRecord = typeof tariffSubheadings.$inferSelect;
export type TariffFractionRecord = typeof tariffFractions.$inferSelect;
export type TariffRegulationRecord = typeof tariffRegulations.$inferSelect;
export type TariffAgreementPreferenceRecord =
  typeof tariffAgreementPreferences.$inferSelect;

@Injectable()
export class TariffClassificationRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  // --- Sections ---

  async findAllSections(): Promise<TariffSectionRecord[]> {
    return this.db
      .select()
      .from(tariffSections)
      .orderBy(asc(tariffSections.sortOrder));
  }

  async findSectionById(id: string): Promise<TariffSectionRecord | undefined> {
    const result = await this.db
      .select()
      .from(tariffSections)
      .where(eq(tariffSections.id, id))
      .limit(1);

    return result[0];
  }

  async insertSection(
    data: typeof tariffSections.$inferInsert,
  ): Promise<TariffSectionRecord> {
    const [created] = await this.db
      .insert(tariffSections)
      .values(data)
      .returning();

    return created;
  }

  async updateSection(
    id: string,
    data: Partial<typeof tariffSections.$inferInsert>,
  ): Promise<TariffSectionRecord> {
    const [updated] = await this.db
      .update(tariffSections)
      .set(data)
      .where(eq(tariffSections.id, id))
      .returning();

    return updated;
  }

  async deleteSection(id: string): Promise<void> {
    await this.db.delete(tariffSections).where(eq(tariffSections.id, id));
  }

  // --- Chapters ---

  async findChaptersBySection(
    sectionId: string,
  ): Promise<TariffChapterRecord[]> {
    return this.db
      .select()
      .from(tariffChapters)
      .where(eq(tariffChapters.sectionId, sectionId))
      .orderBy(asc(tariffChapters.sortOrder));
  }

  async findChapterById(id: string): Promise<TariffChapterRecord | undefined> {
    const result = await this.db
      .select()
      .from(tariffChapters)
      .where(eq(tariffChapters.id, id))
      .limit(1);

    return result[0];
  }

  async insertChapter(
    data: typeof tariffChapters.$inferInsert,
  ): Promise<TariffChapterRecord> {
    const [created] = await this.db
      .insert(tariffChapters)
      .values(data)
      .returning();

    return created;
  }

  async updateChapter(
    id: string,
    data: Partial<typeof tariffChapters.$inferInsert>,
  ): Promise<TariffChapterRecord> {
    const [updated] = await this.db
      .update(tariffChapters)
      .set(data)
      .where(eq(tariffChapters.id, id))
      .returning();

    return updated;
  }

  async deleteChapter(id: string): Promise<void> {
    await this.db.delete(tariffChapters).where(eq(tariffChapters.id, id));
  }

  // --- Headings ---

  async findHeadingsByChapter(
    chapterId: string,
  ): Promise<TariffHeadingRecord[]> {
    return this.db
      .select()
      .from(tariffHeadings)
      .where(eq(tariffHeadings.chapterId, chapterId))
      .orderBy(asc(tariffHeadings.sortOrder));
  }

  async findHeadingById(id: string): Promise<TariffHeadingRecord | undefined> {
    const result = await this.db
      .select()
      .from(tariffHeadings)
      .where(eq(tariffHeadings.id, id))
      .limit(1);

    return result[0];
  }

  async insertHeading(
    data: typeof tariffHeadings.$inferInsert,
  ): Promise<TariffHeadingRecord> {
    const [created] = await this.db
      .insert(tariffHeadings)
      .values(data)
      .returning();

    return created;
  }

  async updateHeading(
    id: string,
    data: Partial<typeof tariffHeadings.$inferInsert>,
  ): Promise<TariffHeadingRecord> {
    const [updated] = await this.db
      .update(tariffHeadings)
      .set(data)
      .where(eq(tariffHeadings.id, id))
      .returning();

    return updated;
  }

  async deleteHeading(id: string): Promise<void> {
    await this.db.delete(tariffHeadings).where(eq(tariffHeadings.id, id));
  }

  // --- Subheadings ---

  async findSubheadingsByHeading(
    headingId: string,
  ): Promise<TariffSubheadingRecord[]> {
    return this.db
      .select()
      .from(tariffSubheadings)
      .where(eq(tariffSubheadings.headingId, headingId))
      .orderBy(asc(tariffSubheadings.sortOrder));
  }

  async findSubheadingById(
    id: string,
  ): Promise<TariffSubheadingRecord | undefined> {
    const result = await this.db
      .select()
      .from(tariffSubheadings)
      .where(eq(tariffSubheadings.id, id))
      .limit(1);

    return result[0];
  }

  async insertSubheading(
    data: typeof tariffSubheadings.$inferInsert,
  ): Promise<TariffSubheadingRecord> {
    const [created] = await this.db
      .insert(tariffSubheadings)
      .values(data)
      .returning();

    return created;
  }

  async updateSubheading(
    id: string,
    data: Partial<typeof tariffSubheadings.$inferInsert>,
  ): Promise<TariffSubheadingRecord> {
    const [updated] = await this.db
      .update(tariffSubheadings)
      .set(data)
      .where(eq(tariffSubheadings.id, id))
      .returning();

    return updated;
  }

  async deleteSubheading(id: string): Promise<void> {
    await this.db.delete(tariffSubheadings).where(eq(tariffSubheadings.id, id));
  }

  // --- Fractions ---

  async findFractionsBySubheading(
    subheadingId: string,
  ): Promise<TariffFractionRecord[]> {
    return this.db
      .select()
      .from(tariffFractions)
      .where(eq(tariffFractions.subheadingId, subheadingId))
      .orderBy(asc(tariffFractions.sortOrder));
  }

  async findFractionById(
    id: string,
  ): Promise<TariffFractionRecord | undefined> {
    const result = await this.db
      .select()
      .from(tariffFractions)
      .where(eq(tariffFractions.id, id))
      .limit(1);

    return result[0];
  }

  async findFractionByCode(
    code: string,
  ): Promise<TariffFractionRecord | undefined> {
    const result = await this.db
      .select()
      .from(tariffFractions)
      .where(eq(tariffFractions.code, code))
      .limit(1);

    return result[0];
  }

  async insertFraction(
    data: typeof tariffFractions.$inferInsert,
  ): Promise<TariffFractionRecord> {
    const [created] = await this.db
      .insert(tariffFractions)
      .values(data)
      .returning();

    return created;
  }

  async updateFraction(
    id: string,
    data: Partial<typeof tariffFractions.$inferInsert>,
  ): Promise<TariffFractionRecord> {
    const [updated] = await this.db
      .update(tariffFractions)
      .set(data)
      .where(eq(tariffFractions.id, id))
      .returning();

    return updated;
  }

  async deleteFraction(id: string): Promise<void> {
    await this.db.delete(tariffFractions).where(eq(tariffFractions.id, id));
  }

  // --- Search ---

  async searchFractions(
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ fractions: TariffFractionRecord[]; total: number }> {
    const pattern = `%${query}%`;

    const whereClause = or(
      ilike(tariffFractions.code, pattern),
      ilike(tariffFractions.description, pattern),
    );

    const [fractions, countResult] = await Promise.all([
      this.db
        .select()
        .from(tariffFractions)
        .where(whereClause)
        .orderBy(asc(tariffFractions.code))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(tariffFractions)
        .where(whereClause),
    ]);

    return { fractions, total: countResult[0].count };
  }

  // --- Regulations ---

  async findRegulationsByFraction(
    fractionId: string,
  ): Promise<TariffRegulationRecord[]> {
    return this.db
      .select()
      .from(tariffRegulations)
      .where(eq(tariffRegulations.fractionId, fractionId));
  }

  // --- Agreement Preferences ---

  async listCustomsOffices() {
    return this.db
      .select()
      .from(customsOffices)
      .orderBy(customsOffices.sortOrder, customsOffices.code);
  }

  async findPreferencesByFraction(fractionId: string): Promise<
    Array<{
      preference: TariffAgreementPreferenceRecord;
      agreement: typeof tradeAgreements.$inferSelect;
    }>
  > {
    return this.db
      .select({
        preference: tariffAgreementPreferences,
        agreement: tradeAgreements,
      })
      .from(tariffAgreementPreferences)
      .innerJoin(
        tradeAgreements,
        eq(tariffAgreementPreferences.agreementId, tradeAgreements.id),
      )
      .where(eq(tariffAgreementPreferences.fractionId, fractionId));
  }
}
