import { Inject, Injectable } from '@nestjs/common';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  savedReports,
  reportExecutions,
  kpiSnapshots,
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
}
