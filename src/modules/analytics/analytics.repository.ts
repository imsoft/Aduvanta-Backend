import { Inject, Injectable } from '@nestjs/common';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  savedReports,
  reportExecutions,
  kpiSnapshots,
  operations,
  customsEntries,
  warehouseInventory,
  importerRegistry,
  immexPrograms,
} from '../../database/schema/index.js';

export type SavedReportRecord = typeof savedReports.$inferSelect;
export type ReportExecutionRecord = typeof reportExecutions.$inferSelect;
export type KpiSnapshotRecord = typeof kpiSnapshots.$inferSelect;

@Injectable()
export class AnalyticsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  // --- Reports ---

  async findReportsByOrganization(
    organizationId: string,
    type: string | undefined,
    limit: number,
    offset: number,
  ): Promise<{ reports: SavedReportRecord[]; total: number }> {
    const conditions = [eq(savedReports.organizationId, organizationId)];

    if (type) {
      conditions.push(eq(savedReports.type, type as 'OPERATIONS_SUMMARY'));
    }

    const where = and(...conditions);

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(savedReports)
        .where(where)
        .orderBy(desc(savedReports.updatedAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(savedReports)
        .where(where),
    ]);

    return { reports: rows, total: countResult[0].count };
  }

  async findReportByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<SavedReportRecord | undefined> {
    const result = await this.db
      .select()
      .from(savedReports)
      .where(
        and(
          eq(savedReports.id, id),
          eq(savedReports.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async insertReport(
    data: typeof savedReports.$inferInsert,
  ): Promise<SavedReportRecord> {
    const [created] = await this.db
      .insert(savedReports)
      .values(data)
      .returning();

    return created;
  }

  async updateReport(
    id: string,
    data: Partial<typeof savedReports.$inferInsert>,
  ): Promise<SavedReportRecord> {
    const [updated] = await this.db
      .update(savedReports)
      .set(data)
      .where(eq(savedReports.id, id))
      .returning();

    return updated;
  }

  async deleteReport(id: string): Promise<void> {
    await this.db.delete(savedReports).where(eq(savedReports.id, id));
  }

  // --- Executions ---

  async findExecutionsByReport(
    reportId: string,
    limit: number,
  ): Promise<ReportExecutionRecord[]> {
    return this.db
      .select()
      .from(reportExecutions)
      .where(eq(reportExecutions.reportId, reportId))
      .orderBy(desc(reportExecutions.createdAt))
      .limit(limit);
  }

  async findExecutionById(
    id: string,
  ): Promise<ReportExecutionRecord | undefined> {
    const result = await this.db
      .select()
      .from(reportExecutions)
      .where(eq(reportExecutions.id, id))
      .limit(1);

    return result[0];
  }

  async insertExecution(
    data: typeof reportExecutions.$inferInsert,
  ): Promise<ReportExecutionRecord> {
    const [created] = await this.db
      .insert(reportExecutions)
      .values(data)
      .returning();

    return created;
  }

  async updateExecution(
    id: string,
    data: Partial<typeof reportExecutions.$inferInsert>,
  ): Promise<ReportExecutionRecord> {
    const [updated] = await this.db
      .update(reportExecutions)
      .set(data)
      .where(eq(reportExecutions.id, id))
      .returning();

    return updated;
  }

  // --- KPI Snapshots ---

  async findKpiSnapshots(
    organizationId: string,
    metricName: string,
    period: string | undefined,
    startDate: Date | undefined,
    endDate: Date | undefined,
  ): Promise<KpiSnapshotRecord[]> {
    const conditions = [
      eq(kpiSnapshots.organizationId, organizationId),
      eq(kpiSnapshots.metricName, metricName),
    ];

    if (period) {
      conditions.push(eq(kpiSnapshots.period, period as 'DAILY'));
    }
    if (startDate) {
      conditions.push(gte(kpiSnapshots.periodStart, startDate));
    }
    if (endDate) {
      conditions.push(lte(kpiSnapshots.periodEnd, endDate));
    }

    return this.db
      .select()
      .from(kpiSnapshots)
      .where(and(...conditions))
      .orderBy(desc(kpiSnapshots.periodStart));
  }

  async insertKpiSnapshot(
    data: typeof kpiSnapshots.$inferInsert,
  ): Promise<KpiSnapshotRecord> {
    const [created] = await this.db
      .insert(kpiSnapshots)
      .values(data)
      .returning();

    return created;
  }

  // --- Dashboard summary ---

  async getDashboardMetrics(organizationId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = now.toISOString().split('T')[0];
    const in30Days = new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0];

    const [
      activeOpsResult,
      entriesThisMonthResult,
      entriesByStatusResult,
      warehouseItemsResult,
      expiringRegistriesResult,
      expiringImmexResult,
    ] = await Promise.all([
      // Active operations
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(operations)
        .where(
          and(
            eq(operations.organizationId, organizationId),
            sql`${operations.status} NOT IN ('COMPLETED', 'CANCELLED', 'ARCHIVED')`,
          ),
        ),

      // Pedimentos this month
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(customsEntries)
        .where(
          and(
            eq(customsEntries.organizationId, organizationId),
            gte(customsEntries.createdAt, new Date(monthStart)),
            lte(customsEntries.createdAt, new Date(monthEnd + 'T23:59:59Z')),
          ),
        ),

      // Entries by status
      this.db
        .select({
          status: customsEntries.status,
          count: sql<number>`count(*)::int`,
        })
        .from(customsEntries)
        .where(eq(customsEntries.organizationId, organizationId))
        .groupBy(customsEntries.status),

      // Warehouse items count
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(warehouseInventory)
        .where(eq(warehouseInventory.organizationId, organizationId)),

      // Expiring importer registries in 30 days
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(importerRegistry)
        .where(
          and(
            eq(importerRegistry.organizationId, organizationId),
            eq(importerRegistry.status, 'ACTIVE'),
            lte(importerRegistry.expirationDate, in30Days),
          ),
        ),

      // Expiring IMMEX programs in 60 days
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(immexPrograms)
        .where(
          and(
            eq(immexPrograms.organizationId, organizationId),
            eq(immexPrograms.status, 'ACTIVE'),
            lte(immexPrograms.expirationDate, new Date(now.getTime() + 60 * 86400000).toISOString().split('T')[0]),
          ),
        ),
    ]);

    const statusMap = Object.fromEntries(
      entriesByStatusResult.map((r) => [r.status, r.count]),
    ) as Record<string, number>;

    return {
      activeOperations: activeOpsResult[0]?.count ?? 0,
      entriesThisMonth: entriesThisMonthResult[0]?.count ?? 0,
      pendingPayments: (statusMap['VALIDATED'] ?? 0),
      pendingPaymentsAmount: null,
      expiringRegistries: (expiringRegistriesResult[0]?.count ?? 0) + (expiringImmexResult[0]?.count ?? 0),
      warehouseItems: warehouseItemsResult[0]?.count ?? 0,
      entriesByStatus: {
        DRAFT: statusMap['DRAFT'] ?? 0,
        PREVALIDATED: statusMap['PREVALIDATED'] ?? 0,
        VALIDATED: statusMap['VALIDATED'] ?? 0,
        PAID: statusMap['PAID'] ?? 0,
        DISPATCHED: statusMap['DISPATCHED'] ?? 0,
        RELEASED: statusMap['RELEASED'] ?? 0,
      },
    };
  }
}
