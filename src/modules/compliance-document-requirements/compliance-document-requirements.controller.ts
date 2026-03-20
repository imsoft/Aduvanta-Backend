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
import { ComplianceDocumentRequirementsService } from './compliance-document-requirements.service.js';
import { CreateDocumentRequirementDto } from './dto/create-document-requirement.dto.js';
import { UpdateDocumentRequirementDto } from './dto/update-document-requirement.dto.js';

@Controller()
@UseGuards(AuthGuard, PermissionsGuard)
export class ComplianceDocumentRequirementsController {
  constructor(
    private readonly requirementsService: ComplianceDocumentRequirementsService,
  ) {}

  @Get('compliance/rule-sets/:ruleSetId/document-requirements')
  @RequirePermission(PERMISSION.COMPLIANCE_READ)
  async listForRuleSet(
    @Headers('x-organization-id') organizationId: string,
    @Param('ruleSetId') ruleSetId: string,
  ) {
    return this.requirementsService.listForRuleSet(ruleSetId, organizationId);
  }

  @Post('compliance/rule-sets/:ruleSetId/document-requirements')
  @RequirePermission(PERMISSION.COMPLIANCE_MANAGE_DOCUMENT_REQUIREMENTS)
  async create(
    @Headers('x-organization-id') organizationId: string,
    @Param('ruleSetId') ruleSetId: string,
    @Body() dto: CreateDocumentRequirementDto,
    @Session() session: ActiveSession,
  ) {
    return this.requirementsService.create(
      ruleSetId,
      organizationId,
      dto,
      session.user.id,
    );
  }

  @Patch('compliance/document-requirements/:requirementId')
  @RequirePermission(PERMISSION.COMPLIANCE_MANAGE_DOCUMENT_REQUIREMENTS)
  async update(
    @Headers('x-organization-id') organizationId: string,
    @Param('requirementId') requirementId: string,
    @Body() dto: UpdateDocumentRequirementDto,
    @Session() session: ActiveSession,
  ) {
    return this.requirementsService.update(
      requirementId,
      organizationId,
      dto,
      session.user.id,
    );
  }

  @Delete('compliance/document-requirements/:requirementId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION.COMPLIANCE_MANAGE_DOCUMENT_REQUIREMENTS)
  async delete(
    @Headers('x-organization-id') organizationId: string,
    @Param('requirementId') requirementId: string,
    @Session() session: ActiveSession,
  ) {
    await this.requirementsService.delete(
      requirementId,
      organizationId,
      session.user.id,
    );
  }
}
