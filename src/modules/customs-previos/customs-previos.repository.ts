import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm';
import { DATABASE } from '../../database/database.module.js';
import type { Database } from '../../database/database.module.js';
import {
  customsPrevios,
  customsPrevioItems,
} from '../../database/schema/customs-previos.schema.js';

export type PrevioRecord = typeof customsPrevios.$inferSelect;
export type PrevioItemRecord = typeof customsPrevioItems.$inferSelect;

@Injectable()
export class CustomsPreviosRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findByOrganization(
    organizationId: string,
    limit: number,
    offset: number,
    filters: { entryId?: string; status?: string; q?: string } = {},
  ): Promise<{ previos: PrevioRecord[]; total: number }> {
    const conditions = [eq(customsPrevios.organizationId, organizationId)];

    if (filters.entryId) {
      conditions.push(eq(customsPrevios.entryId, filters.entryId));
    }
    if (filters.status) {
      conditions.push(
        eq(
          customsPrevios.status,
          filters.status as PrevioRecord['status'],
        ),
      );
    }
    if (filters.q) {
      const pattern = `%${filters.q}%`;
      conditions.push(
        or(
          ilike(customsPrevios.previoNumber, pattern),
          ilike(customsPrevios.warehouseName, pattern),
          ilike(customsPrevios.containerNumbers, pattern),
        )!,
      );
    }

    const where = and(...conditions);

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(customsPrevios)
        .where(where)
        .orderBy(desc(customsPrevios.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(customsPrevios)
        .where(where),
    ]);

    return { previos: rows, total: countResult[0].count };
  }

  async findByOrganizationAndId(
    id: string,
    organizationId: string,
  ): Promise<PrevioRecord | undefined> {
    const [row] = await this.db
      .select()
      .from(customsPrevios)
      .where(
        and(
          eq(customsPrevios.id, id),
          eq(customsPrevios.organizationId, organizationId),
        ),
      );
    return row;
  }

  async findItemsByPrevio(previoId: string): Promise<PrevioItemRecord[]> {
    return this.db
      .select()
      .from(customsPrevioItems)
      .where(eq(customsPrevioItems.previoId, previoId))
      .orderBy(customsPrevioItems.sequenceNumber);
  }

  async insert(
    data: typeof customsPrevios.$inferInsert,
  ): Promise<PrevioRecord> {
    const [created] = await this.db
      .insert(customsPrevios)
      .values(data)
      .returning();
    return created;
  }

  async update(
    id: string,
    data: Partial<typeof customsPrevios.$inferInsert>,
  ): Promise<PrevioRecord> {
    const [updated] = await this.db
      .update(customsPrevios)
      .set(data)
      .where(eq(customsPrevios.id, id))
      .returning();
    return updated;
  }

  async insertItem(
    data: typeof customsPrevioItems.$inferInsert,
  ): Promise<PrevioItemRecord> {
    const [created] = await this.db
      .insert(customsPrevioItems)
      .values(data)
      .returning();
    return created;
  }

  async deleteItem(itemId: string): Promise<void> {
    await this.db
      .delete(customsPrevioItems)
      .where(eq(customsPrevioItems.id, itemId));
  }
}
