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
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Session } from '../../common/decorators/session.decorator.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { ComplianceRuleSetsService } from './compliance-rule-sets.service.js';
import { CreateRuleSetDto } from './dto/create-rule-set.dto.js';
import { UpdateRuleSetDto } from './dto/update-rule-set.dto.js';
import { ListRuleSetsDto } from './dto/list-rule-sets.dto.js';

@Controller('compliance/rule-sets')
@UseGuards(AuthGuard, PermissionsGuard)
export class ComplianceRuleSetsController {
  constructor(private readonly ruleSetsService: ComplianceRuleSetsService) {}

  @Get()
  @RequirePermission(PERMISSION.COMPLIANCE_READ)
  async list(
    @Headers('x-organization-id') organizationId: string,
    @Query() query: ListRuleSetsDto,
  ) {
    return this.ruleSetsService.list(organizationId, query);
  }

  @Post()
  @RequirePermission(PERMISSION.COMPLIANCE_MANAGE_RULE_SETS)
  async create(
    @Headers('x-organization-id') organizationId: string,
    @Body() dto: CreateRuleSetDto,
    @Session() session: ActiveSession,
  ) {
    return this.ruleSetsService.create(organizationId, dto, session.user.id);
  }

  @Get(':ruleSetId')
  @RequirePermission(PERMISSION.COMPLIANCE_READ)
  async getById(
    @Headers('x-organization-id') organizationId: string,
    @Param('ruleSetId') ruleSetId: string,
  ) {
    return this.ruleSetsService.getById(ruleSetId, organizationId);
  }

  @Patch(':ruleSetId')
  @RequirePermission(PERMISSION.COMPLIANCE_MANAGE_RULE_SETS)
  async update(
    @Headers('x-organization-id') organizationId: string,
    @Param('ruleSetId') ruleSetId: string,
    @Body() dto: UpdateRuleSetDto,
    @Session() session: ActiveSession,
  ) {
    return this.ruleSetsService.update(ruleSetId, organizationId, dto, session.user.id);
  }

  @Delete(':ruleSetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION.COMPLIANCE_MANAGE_RULE_SETS)
  async delete(
    @Headers('x-organization-id') organizationId: string,
    @Param('ruleSetId') ruleSetId: string,
    @Session() session: ActiveSession,
  ) {
    await this.ruleSetsService.delete(ruleSetId, organizationId, session.user.id);
  }
}
