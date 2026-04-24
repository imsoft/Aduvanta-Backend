import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm';
import { DATABASE } from '../../database/database.module.js';
import type { Database } from '../../database/database.module.js';
import {
  importerRegistry,
  importerRegistrySectors,
  exporterRegistry,
} from '../../database/schema/importer-registry.schema.js';

export type ImporterRegistryRecord = typeof importerRegistry.$inferSelect;
export type ImporterRegistrySectorRecord = typeof importerRegistrySectors.$inferSelect;
export type ExporterRegistryRecord = typeof exporterRegistry.$inferSelect;

@Injectable()
export class ImporterRegistryRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findImportersByOrganization(
    organizationId: string,
    limit: number,
    offset: number,
    filters: { q?: string; status?: string; clientId?: string } = {},
  ): Promise<{ registries: ImporterRegistryRecord[]; total: number }> {
    const conditions = [eq(importerRegistry.organizationId, organizationId)];

    if (filters.clientId) {
      conditions.push(eq(importerRegistry.clientId, filters.clientId));
    }
    if (filters.status) {
      conditions.push(
        eq(
          importerRegistry.status,
          filters.status as ImporterRegistryRecord['status'],
        ),
      );
    }
    if (filters.q) {
      const pattern = `%${filters.q}%`;
      conditions.push(
        or(
          ilike(importerRegistry.rfc, pattern),
          ilike(importerRegistry.businessName, pattern),
          ilike(importerRegistry.satFolioNumber, pattern),
        )!,
      );
    }

    const where = and(...conditions);

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(importerRegistry)
        .where(where)
        .orderBy(desc(importerRegistry.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(importerRegistry)
        .where(where),
    ]);

    return { registries: rows, total: countResult[0].count };
  }

  async findImporterByOrganizationAndId(
    id: string,
    organizationId: string,
  ): Promise<ImporterRegistryRecord | undefined> {
    const [row] = await this.db
      .select()
      .from(importerRegistry)
      .where(
        and(
          eq(importerRegistry.id, id),
          eq(importerRegistry.organizationId, organizationId),
        ),
      );
    return row;
  }

  async findSectorsByRegistry(
    registryId: string,
  ): Promise<ImporterRegistrySectorRecord[]> {
    return this.db
      .select()
      .from(importerRegistrySectors)
      .where(eq(importerRegistrySectors.registryId, registryId));
  }

  async findExpiringImporters(
    organizationId: string,
    withinDays: number,
  ): Promise<ImporterRegistryRecord[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + withinDays);

    return this.db
      .select()
      .from(importerRegistry)
      .where(
        and(
          eq(importerRegistry.organizationId, organizationId),
          eq(importerRegistry.status, 'ACTIVE'),
          sql`${importerRegistry.expirationDate} <= ${cutoffDate.toISOString().split('T')[0]}`,
        ),
      )
      .orderBy(importerRegistry.expirationDate);
  }

  async insertImporter(
    data: typeof importerRegistry.$inferInsert,
  ): Promise<ImporterRegistryRecord> {
    const [created] = await this.db
      .insert(importerRegistry)
      .values(data)
      .returning();
    return created;
  }

  async updateImporter(
    id: string,
    data: Partial<typeof importerRegistry.$inferInsert>,
  ): Promise<ImporterRegistryRecord> {
    const [updated] = await this.db
      .update(importerRegistry)
      .set(data)
      .where(eq(importerRegistry.id, id))
      .returning();
    return updated;
  }

  async insertSector(
    data: typeof importerRegistrySectors.$inferInsert,
  ): Promise<ImporterRegistrySectorRecord> {
    const [created] = await this.db
      .insert(importerRegistrySectors)
      .values(data)
      .returning();
    return created;
  }

  async deleteSector(sectorId: string): Promise<void> {
    await this.db
      .delete(importerRegistrySectors)
      .where(eq(importerRegistrySectors.id, sectorId));
  }

  // Exporter registry methods
  async findExportersByOrganization(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ registries: ExporterRegistryRecord[]; total: number }> {
    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(exporterRegistry)
        .where(eq(exporterRegistry.organizationId, organizationId))
        .orderBy(desc(exporterRegistry.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(exporterRegistry)
        .where(eq(exporterRegistry.organizationId, organizationId)),
    ]);

    return { registries: rows, total: countResult[0].count };
  }
}
