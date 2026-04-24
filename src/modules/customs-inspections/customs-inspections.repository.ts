import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc, sql } from 'drizzle-orm';
import { DATABASE } from '../../database/database.module.js';
import type { Database } from '../../database/database.module.js';
import {
  customsInspections,
  customsInspectionItems,
} from '../../database/schema/customs-inspections.schema.js';

export type InspectionRecord = typeof customsInspections.$inferSelect;
export type InspectionItemRecord = typeof customsInspectionItems.$inferSelect;

@Injectable()
export class CustomsInspectionsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findByOrganization(
    organizationId: string,
    limit: number,
    offset: number,
    filters: {
      entryId?: string;
      semaphoreColor?: string;
      inspectionResult?: string;
    } = {},
  ): Promise<{ inspections: InspectionRecord[]; total: number }> {
    const conditions = [eq(customsInspections.organizationId, organizationId)];

    if (filters.entryId) {
      conditions.push(eq(customsInspections.entryId, filters.entryId));
    }
    if (filters.semaphoreColor) {
      conditions.push(
        eq(
          customsInspections.semaphoreColor,
          filters.semaphoreColor as 'GREEN' | 'RED',
        ),
      );
    }
    if (filters.inspectionResult) {
      conditions.push(
        eq(
          customsInspections.inspectionResult,
          filters.inspectionResult as InspectionRecord['inspectionResult'],
        ),
      );
    }

    const where = and(...conditions);

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(customsInspections)
        .where(where)
        .orderBy(desc(customsInspections.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(customsInspections)
        .where(where),
    ]);

    return { inspections: rows, total: countResult[0].count };
  }

  async findById(id: string): Promise<InspectionRecord | undefined> {
    const [row] = await this.db
      .select()
      .from(customsInspections)
      .where(eq(customsInspections.id, id));
    return row;
  }

  async findByOrganizationAndId(
    id: string,
    organizationId: string,
  ): Promise<InspectionRecord | undefined> {
    const [row] = await this.db
      .select()
      .from(customsInspections)
      .where(
        and(
          eq(customsInspections.id, id),
          eq(customsInspections.organizationId, organizationId),
        ),
      );
    return row;
  }

  async findByEntry(entryId: string): Promise<InspectionRecord[]> {
    return this.db
      .select()
      .from(customsInspections)
      .where(eq(customsInspections.entryId, entryId))
      .orderBy(desc(customsInspections.createdAt));
  }

  async findItemsByInspection(
    inspectionId: string,
  ): Promise<InspectionItemRecord[]> {
    return this.db
      .select()
      .from(customsInspectionItems)
      .where(eq(customsInspectionItems.inspectionId, inspectionId));
  }

  async insert(
    data: typeof customsInspections.$inferInsert,
  ): Promise<InspectionRecord> {
    const [created] = await this.db
      .insert(customsInspections)
      .values(data)
      .returning();
    return created;
  }

  async update(
    id: string,
    data: Partial<typeof customsInspections.$inferInsert>,
  ): Promise<InspectionRecord> {
    const [updated] = await this.db
      .update(customsInspections)
      .set(data)
      .where(eq(customsInspections.id, id))
      .returning();
    return updated;
  }

  async insertItem(
    data: typeof customsInspectionItems.$inferInsert,
  ): Promise<InspectionItemRecord> {
    const [created] = await this.db
      .insert(customsInspectionItems)
      .values(data)
      .returning();
    return created;
  }

  async deleteItem(itemId: string): Promise<void> {
    await this.db
      .delete(customsInspectionItems)
      .where(eq(customsInspectionItems.id, itemId));
  }
}
