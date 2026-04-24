import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm';
import { DATABASE } from '../../database/database.module.js';
import type { Database } from '../../database/database.module.js';
import {
  immexPrograms,
  immexAuthorizedProducts,
  immexMachinery,
  immexVirtualOperations,
} from '../../database/schema/immex-programs.schema.js';

export type ImmexProgramRecord = typeof immexPrograms.$inferSelect;
export type ImmexProductRecord = typeof immexAuthorizedProducts.$inferSelect;
export type ImmexMachineryRecord = typeof immexMachinery.$inferSelect;

@Injectable()
export class ImmexProgramsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findByOrganization(
    organizationId: string,
    limit: number,
    offset: number,
    filters: { q?: string; status?: string; clientId?: string } = {},
  ): Promise<{ programs: ImmexProgramRecord[]; total: number }> {
    const conditions = [eq(immexPrograms.organizationId, organizationId)];

    if (filters.clientId) {
      conditions.push(eq(immexPrograms.clientId, filters.clientId));
    }
    if (filters.status) {
      conditions.push(
        eq(
          immexPrograms.status,
          filters.status as ImmexProgramRecord['status'],
        ),
      );
    }
    if (filters.q) {
      const pattern = `%${filters.q}%`;
      conditions.push(
        or(
          ilike(immexPrograms.programNumber, pattern),
          ilike(immexPrograms.rfc, pattern),
          ilike(immexPrograms.businessName, pattern),
        )!,
      );
    }

    const where = and(...conditions);

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(immexPrograms)
        .where(where)
        .orderBy(desc(immexPrograms.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(immexPrograms)
        .where(where),
    ]);

    return { programs: rows, total: countResult[0].count };
  }

  async findByOrganizationAndId(
    id: string,
    organizationId: string,
  ): Promise<ImmexProgramRecord | undefined> {
    const [row] = await this.db
      .select()
      .from(immexPrograms)
      .where(
        and(
          eq(immexPrograms.id, id),
          eq(immexPrograms.organizationId, organizationId),
        ),
      );
    return row;
  }

  async findExpiringPrograms(
    organizationId: string,
    withinDays: number,
  ): Promise<ImmexProgramRecord[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + withinDays);

    return this.db
      .select()
      .from(immexPrograms)
      .where(
        and(
          eq(immexPrograms.organizationId, organizationId),
          eq(immexPrograms.status, 'ACTIVE'),
          sql`${immexPrograms.expirationDate} <= ${cutoffDate.toISOString().split('T')[0]}`,
        ),
      )
      .orderBy(immexPrograms.expirationDate);
  }

  async findProductsByProgram(programId: string): Promise<ImmexProductRecord[]> {
    return this.db
      .select()
      .from(immexAuthorizedProducts)
      .where(eq(immexAuthorizedProducts.programId, programId));
  }

  async findMachineryByProgram(
    programId: string,
  ): Promise<ImmexMachineryRecord[]> {
    return this.db
      .select()
      .from(immexMachinery)
      .where(eq(immexMachinery.programId, programId))
      .orderBy(desc(immexMachinery.createdAt));
  }

  async insert(
    data: typeof immexPrograms.$inferInsert,
  ): Promise<ImmexProgramRecord> {
    const [created] = await this.db
      .insert(immexPrograms)
      .values(data)
      .returning();
    return created;
  }

  async update(
    id: string,
    data: Partial<typeof immexPrograms.$inferInsert>,
  ): Promise<ImmexProgramRecord> {
    const [updated] = await this.db
      .update(immexPrograms)
      .set(data)
      .where(eq(immexPrograms.id, id))
      .returning();
    return updated;
  }

  async insertProduct(
    data: typeof immexAuthorizedProducts.$inferInsert,
  ): Promise<ImmexProductRecord> {
    const [created] = await this.db
      .insert(immexAuthorizedProducts)
      .values(data)
      .returning();
    return created;
  }

  async deleteProduct(productId: string): Promise<void> {
    await this.db
      .delete(immexAuthorizedProducts)
      .where(eq(immexAuthorizedProducts.id, productId));
  }

  async insertMachinery(
    data: typeof immexMachinery.$inferInsert,
  ): Promise<ImmexMachineryRecord> {
    const [created] = await this.db
      .insert(immexMachinery)
      .values(data)
      .returning();
    return created;
  }

  async updateMachinery(
    id: string,
    data: Partial<typeof immexMachinery.$inferInsert>,
  ): Promise<ImmexMachineryRecord> {
    const [updated] = await this.db
      .update(immexMachinery)
      .set(data)
      .where(eq(immexMachinery.id, id))
      .returning();
    return updated;
  }
}
