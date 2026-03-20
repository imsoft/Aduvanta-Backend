import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Session } from '../../common/decorators/session.decorator.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { AnalyticsService } from './analytics.service.js';
import { CreateReportDto } from './dto/create-report.dto.js';
import { UpdateReportDto } from './dto/update-report.dto.js';
import { ExecuteReportDto } from './dto/execute-report.dto.js';
import { ListReportsDto } from './dto/list-reports.dto.js';
import { QueryKpiDto } from './dto/query-kpi.dto.js';

@Controller('analytics')
@UseGuards(AuthGuard, PermissionsGuard)
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  // ========== Reports ==========

  @Get('reports')
  @RequirePermission(PERMISSION.ANALYTICS_READ)
  async listReports(
    @Query() dto: ListReportsDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.service.listReports(organizationId, dto.type, limit, offset);
  }

  @Get('reports/:id')
  @RequirePermission(PERMISSION.ANALYTICS_READ)
  async getReportById(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getReportDetails(id, organizationId);
  }

  @Post('reports')
  @RequirePermission(PERMISSION.ANALYTICS_REPORTS_CREATE)
  async createReport(
    @Body() dto: CreateReportDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.createReport(dto, session.user.id, organizationId);
  }

  @Patch('reports/:id')
  @RequirePermission(PERMISSION.ANALYTICS_REPORTS_UPDATE)
  async updateReport(
    @Param('id') id: string,
    @Body() dto: UpdateReportDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.updateReport(id, dto, session.user.id, organizationId);
  }

  @Delete('reports/:id')
  @RequirePermission(PERMISSION.ANALYTICS_REPORTS_DELETE)
  async deleteReport(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.service.deleteReport(id, session.user.id, organizationId);
    return { success: true };
  }

  // ========== Executions ==========

  @Post('reports/:reportId/execute')
  @RequirePermission(PERMISSION.ANALYTICS_REPORTS_EXECUTE)
  async executeReport(
    @Param('reportId') reportId: string,
    @Body() dto: ExecuteReportDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.executeReport(
      reportId,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Get('reports/:reportId/executions')
  @RequirePermission(PERMISSION.ANALYTICS_READ)
  async listExecutions(
    @Param('reportId') reportId: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.listExecutions(reportId, organizationId);
  }

  @Get('reports/:reportId/executions/:executionId')
  @RequirePermission(PERMISSION.ANALYTICS_READ)
  async getExecutionById(
    @Param('reportId') reportId: string,
    @Param('executionId') executionId: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getExecutionById(reportId, executionId, organizationId);
  }

  // ========== KPIs ==========

  @Get('kpi')
  @RequirePermission(PERMISSION.ANALYTICS_KPI_READ)
  async queryKpi(
    @Query() dto: QueryKpiDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.queryKpi(
      organizationId,
      dto.metricName,
      dto.period,
      dto.startDate,
      dto.endDate,
    );
  }
}
