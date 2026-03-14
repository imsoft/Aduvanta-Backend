import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Session } from '../../common/decorators/session.decorator.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { ComplianceStatusRulesService } from './compliance-status-rules.service.js';
import { CreateStatusTransitionRuleDto } from './dto/create-status-transition-rule.dto.js';
import { UpdateStatusTransitionRuleDto } from './dto/update-status-transition-rule.dto.js';

@Controller()
@UseGuards(AuthGuard, PermissionsGuard)
export class ComplianceStatusRulesController {
  constructor(private readonly statusRulesService: ComplianceStatusRulesService) {}

  @Get('compliance/rule-sets/:ruleSetId/status-rules')
  @RequirePermission(PERMISSION.COMPLIANCE_READ)
  async listForRuleSet(
    @Headers('x-organization-id') organizationId: string,
    @Param('ruleSetId') ruleSetId: string,
  ) {
    return this.statusRulesService.listForRuleSet(ruleSetId, organizationId);
  }

  @Post('compliance/rule-sets/:ruleSetId/status-rules')
  @RequirePermission(PERMISSION.COMPLIANCE_MANAGE_STATUS_RULES)
  async create(
    @Headers('x-organization-id') organizationId: string,
    @Param('ruleSetId') ruleSetId: string,
    @Body() dto: CreateStatusTransitionRuleDto,
    @Session() session: ActiveSession,
  ) {
    return this.statusRulesService.create(ruleSetId, organizationId, dto, session.user.id);
  }

  @Patch('compliance/status-rules/:statusRuleId')
  @RequirePermission(PERMISSION.COMPLIANCE_MANAGE_STATUS_RULES)
  async update(
    @Headers('x-organization-id') organizationId: string,
    @Param('statusRuleId') statusRuleId: string,
    @Body() dto: UpdateStatusTransitionRuleDto,
    @Session() session: ActiveSession,
  ) {
    return this.statusRulesService.update(
      statusRuleId,
      organizationId,
      dto,
      session.user.id,
    );
  }

  @Delete('compliance/status-rules/:statusRuleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION.COMPLIANCE_MANAGE_STATUS_RULES)
  async delete(
    @Headers('x-organization-id') organizationId: string,
    @Param('statusRuleId') statusRuleId: string,
    @Session() session: ActiveSession,
  ) {
    await this.statusRulesService.delete(
      statusRuleId,
      organizationId,
      session.user.id,
    );
  }
}
