import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  AnalyticsRepository,
  type SavedReportRecord,
  type ReportExecutionRecord,
  type KpiSnapshotRecord,
} from './analytics.repository.js';
import type { CreateReportDto } from './dto/create-report.dto.js';
import type { UpdateReportDto } from './dto/update-report.dto.js';
import type { ExecuteReportDto } from './dto/execute-report.dto.js';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  // ========== Reports ==========

  async listReports(
    organizationId: string,
    type: string | undefined,
    limit: number,
    offset: number,
  ): Promise<{ reports: SavedReportRecord[]; total: number }> {
    return this.repository.findReportsByOrganization(
      organizationId,
      type,
      limit,
      offset,
    );
  }

  async getReportById(
    id: string,
    organizationId: string,
  ): Promise<SavedReportRecord> {
    const report = await this.repository.findReportByIdAndOrg(
      id,
      organizationId,
    );
    if (!report) {
      throw new NotFoundException(`Report ${id} not found`);
    }
    return report;
  }

  async getReportDetails(id: string, organizationId: string) {
    const report = await this.getReportById(id, organizationId);
    const executions = await this.repository.findExecutionsByReport(id, 10);
    return { ...report, recentExecutions: executions };
  }

  async createReport(
    dto: CreateReportDto,
    actorId: string,
    organizationId: string,
  ): Promise<SavedReportRecord> {
    const report = await this.repository.insertReport({
      organizationId,
      type: dto.type as 'OPERATIONS_SUMMARY',
      format: (dto.format as 'TABLE') ?? 'TABLE',
      name: dto.name,
      description: dto.description,
      queryConfig: dto.queryConfig,
      filtersConfig: dto.filtersConfig,
      columnsConfig: dto.columnsConfig,
      chartConfig: dto.chartConfig,
      isShared: dto.isShared ?? false,
      isDefault: dto.isDefault ?? false,
      createdById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.REPORT_CREATED,
      resource: 'saved_report',
      resourceId: report.id,
      metadata: { type: report.type, name: report.name },
    });

    return report;
  }

  async updateReport(
    id: string,
    dto: UpdateReportDto,
    actorId: string,
    organizationId: string,
  ): Promise<SavedReportRecord> {
    await this.getReportById(id, organizationId);

    const updateData: Record<string, unknown> = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.description) updateData.description = dto.description;
    if (dto.format) updateData.format = dto.format as 'TABLE';
    if (dto.queryConfig) updateData.queryConfig = dto.queryConfig;
    if (dto.filtersConfig) updateData.filtersConfig = dto.filtersConfig;
    if (dto.columnsConfig) updateData.columnsConfig = dto.columnsConfig;
    if (dto.chartConfig) updateData.chartConfig = dto.chartConfig;
    if (dto.isShared !== undefined) updateData.isShared = dto.isShared;
    if (dto.isDefault !== undefined) updateData.isDefault = dto.isDefault;

    const updated = await this.repository.updateReport(
      id,
      updateData as Partial<
        typeof import('../../database/schema/index.js').savedReports.$inferInsert
      >,
    );

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.REPORT_UPDATED,
      resource: 'saved_report',
      resourceId: id,
      metadata: { ...dto },
    });

    return updated;
  }

  async deleteReport(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const report = await this.getReportById(id, organizationId);
    await this.repository.deleteReport(id);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.REPORT_DELETED,
      resource: 'saved_report',
      resourceId: id,
      metadata: { name: report.name, type: report.type },
    });
  }

  // ========== Executions ==========

  async executeReport(
    reportId: string,
    dto: ExecuteReportDto,
    actorId: string,
    organizationId: string,
  ): Promise<ReportExecutionRecord> {
    await this.getReportById(reportId, organizationId);

    const startTime = Date.now();

    const execution = await this.repository.insertExecution({
      reportId,
      status: 'RUNNING',
      filtersApplied: dto.filtersApplied,
      exportFormat: dto.exportFormat,
      executedById: actorId,
      startedAt: new Date(),
    });

    // TODO: Actual report execution logic will be implemented
    // when query engine is built. For now, mark as completed.
    const executionTimeMs = Date.now() - startTime;

    const completed = await this.repository.updateExecution(execution.id, {
      status: 'COMPLETED' as 'PENDING',
      resultData: '[]',
      rowCount: 0,
      executionTimeMs,
      completedAt: new Date(),
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.REPORT_EXECUTED,
      resource: 'report_execution',
      resourceId: execution.id,
      metadata: { reportId, executionTimeMs },
    });

    return completed;
  }

  async getExecutionById(
    reportId: string,
    executionId: string,
    organizationId: string,
  ): Promise<ReportExecutionRecord> {
    await this.getReportById(reportId, organizationId);

    const execution = await this.repository.findExecutionById(executionId);
    if (!execution || execution.reportId !== reportId) {
      throw new NotFoundException(`Execution ${executionId} not found`);
    }
    return execution;
  }

  async listExecutions(
    reportId: string,
    organizationId: string,
  ): Promise<ReportExecutionRecord[]> {
    await this.getReportById(reportId, organizationId);
    return this.repository.findExecutionsByReport(reportId, 50);
  }

  // ========== KPIs ==========

  async queryKpi(
    organizationId: string,
    metricName: string,
    period: string | undefined,
    startDate: string | undefined,
    endDate: string | undefined,
  ): Promise<KpiSnapshotRecord[]> {
    return this.repository.findKpiSnapshots(
      organizationId,
      metricName,
      period,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  async getDashboardSummary(organizationId: string) {
    return this.repository.getDashboardMetrics(organizationId);
  }
}
