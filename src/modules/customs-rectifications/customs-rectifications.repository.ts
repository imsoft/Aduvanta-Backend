import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc, sql } from 'drizzle-orm';
import { DATABASE } from '../../database/database.module.js';
import type { Database } from '../../database/database.module.js';
import {
  customsRectifications,
  rectificationFieldChanges,
} from '../../database/schema/customs-rectifications.schema.js';

export type RectificationRecord = typeof customsRectifications.$inferSelect;
export type FieldChangeRecord = typeof rectificationFieldChanges.$inferSelect;

@Injectable()
export class CustomsRectificationsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findByOrganization(
    organizationId: string,
    limit: number,
    offset: number,
    filters: { originalEntryId?: string } = {},
  ): Promise<{ rectifications: RectificationRecord[]; total: number }> {
    const conditions = [
      eq(customsRectifications.organizationId, organizationId),
    ];

    if (filters.originalEntryId) {
      conditions.push(
        eq(customsRectifications.originalEntryId, filters.originalEntryId),
      );
    }

    const where = and(...conditions);

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(customsRectifications)
        .where(where)
        .orderBy(desc(customsRectifications.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(customsRectifications)
        .where(where),
    ]);

    return { rectifications: rows, total: countResult[0].count };
  }

  async findByOrganizationAndId(
    id: string,
    organizationId: string,
  ): Promise<RectificationRecord | undefined> {
    const [row] = await this.db
      .select()
      .from(customsRectifications)
      .where(
        and(
          eq(customsRectifications.id, id),
          eq(customsRectifications.organizationId, organizationId),
        ),
      );
    return row;
  }

  async findByOriginalEntry(
    originalEntryId: string,
  ): Promise<RectificationRecord[]> {
    return this.db
      .select()
      .from(customsRectifications)
      .where(eq(customsRectifications.originalEntryId, originalEntryId))
      .orderBy(customsRectifications.sequenceNumber);
  }

  async countByOriginalEntry(originalEntryId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(customsRectifications)
      .where(eq(customsRectifications.originalEntryId, originalEntryId));
    return result.count;
  }

  async findFieldChanges(rectificationId: string): Promise<FieldChangeRecord[]> {
    return this.db
      .select()
      .from(rectificationFieldChanges)
      .where(eq(rectificationFieldChanges.rectificationId, rectificationId));
  }

  async insert(
    data: typeof customsRectifications.$inferInsert,
  ): Promise<RectificationRecord> {
    const [created] = await this.db
      .insert(customsRectifications)
      .values(data)
      .returning();
    return created;
  }

  async update(
    id: string,
    data: Partial<typeof customsRectifications.$inferInsert>,
  ): Promise<RectificationRecord> {
    const [updated] = await this.db
      .update(customsRectifications)
      .set(data)
      .where(eq(customsRectifications.id, id))
      .returning();
    return updated;
  }

  async insertFieldChange(
    data: typeof rectificationFieldChanges.$inferInsert,
  ): Promise<FieldChangeRecord> {
    const [created] = await this.db
      .insert(rectificationFieldChanges)
      .values(data)
      .returning();
    return created;
  }

  async insertFieldChanges(
    changes: (typeof rectificationFieldChanges.$inferInsert)[],
  ): Promise<FieldChangeRecord[]> {
    if (changes.length === 0) return [];
    return this.db
      .insert(rectificationFieldChanges)
      .values(changes)
      .returning();
  }
}
