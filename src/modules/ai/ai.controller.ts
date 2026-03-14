import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Session } from '../../common/decorators/session.decorator.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import { AiSearchService } from './ai-search.service.js';
import { AiSignalsService } from './ai-signals.service.js';
import { AiSummariesService } from './ai-summaries.service.js';
import { CreateAiSearchQueryDto } from './dto/create-ai-search-query.dto.js';

@Controller('ai')
@UseGuards(AuthGuard, PermissionsGuard)
export class AiController {
  constructor(
    private readonly aiSearchService: AiSearchService,
    private readonly aiSignalsService: AiSignalsService,
    private readonly aiSummariesService: AiSummariesService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Post('search')
  @RequirePermission(PERMISSION.AI_SEARCH)
  async search(
    @Headers('x-organization-id') organizationId: string,
    @Session() session: ActiveSession,
    @Body() dto: CreateAiSearchQueryDto,
  ) {
    const result = await this.aiSearchService.search(
      organizationId,
      dto.queryType,
      dto.queryText,
    );

    await this.auditLogsService.log({
      organizationId,
      actorId: session.user.id,
      action: AUDIT_ACTION.AI_QUERY_EXECUTED,
      resource: 'ai_search',
      resourceId: organizationId,
      metadata: {
        queryType: dto.queryType,
        queryText: dto.queryText,
        resultCount: result.data.length,
      },
    });

    return result;
  }

  @Post('operations/:operationId/summary')
  @RequirePermission(PERMISSION.AI_GENERATE_SUMMARY)
  async generateSummary(
    @Headers('x-organization-id') organizationId: string,
    @Session() session: ActiveSession,
    @Param('operationId') operationId: string,
  ) {
    const summary = await this.aiSummariesService.generateSummary(
      operationId,
      organizationId,
    );

    await this.auditLogsService.log({
      organizationId,
      actorId: session.user.id,
      action: AUDIT_ACTION.AI_SUMMARY_GENERATED,
      resource: 'operation',
      resourceId: operationId,
      metadata: { operationId },
    });

    return summary;
  }

  @Get('operations/:operationId/signals')
  @RequirePermission(PERMISSION.AI_VIEW_SIGNALS)
  async getSignals(
    @Headers('x-organization-id') organizationId: string,
    @Session() session: ActiveSession,
    @Param('operationId') operationId: string,
  ) {
    const signals = await this.aiSignalsService.computeSignals(
      operationId,
      organizationId,
    );

    await this.auditLogsService.log({
      organizationId,
      actorId: session.user.id,
      action: AUDIT_ACTION.AI_SIGNALS_VIEWED,
      resource: 'operation',
      resourceId: operationId,
      metadata: { operationId, signalCount: signals.length },
    });

    return { operationId, signals };
  }
}
