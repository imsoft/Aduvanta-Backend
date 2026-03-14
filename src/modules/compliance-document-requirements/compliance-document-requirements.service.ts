import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import { ComplianceRuleSetsService } from '../compliance-rule-sets/compliance-rule-sets.service.js';
import { DocumentCategoriesRepository } from '../document-categories/document-categories.repository.js';
import type { DocumentRequirementRecord } from './compliance-document-requirements.repository.js';
import { ComplianceDocumentRequirementsRepository } from './compliance-document-requirements.repository.js';
import type { CreateDocumentRequirementDto } from './dto/create-document-requirement.dto.js';
import type { UpdateDocumentRequirementDto } from './dto/update-document-requirement.dto.js';

@Injectable()
export class ComplianceDocumentRequirementsService {
  constructor(
    private readonly requirementsRepository: ComplianceDocumentRequirementsRepository,
    private readonly ruleSetsService: ComplianceRuleSetsService,
    private readonly categoriesRepository: DocumentCategoriesRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async listForRuleSet(
    ruleSetId: string,
    organizationId: string,
  ): Promise<DocumentRequirementRecord[]> {
    await this.ruleSetsService.getById(ruleSetId, organizationId);
    return this.requirementsRepository.findByRuleSet(ruleSetId, organizationId);
  }

  async create(
    ruleSetId: string,
    organizationId: string,
    dto: CreateDocumentRequirementDto,
    actorId: string,
  ): Promise<DocumentRequirementRecord> {
    await this.ruleSetsService.getById(ruleSetId, organizationId);

    const category = await this.categoriesRepository.findById(dto.documentCategoryId);
    if (!category || category.organizationId !== organizationId) {
      throw new NotFoundException(
        `Document category ${dto.documentCategoryId} not found in this organization`,
      );
    }

    const existing = await this.requirementsRepository.findByRuleSetAndCategory(
      ruleSetId,
      dto.documentCategoryId,
    );
    if (existing) {
      throw new ConflictException(
        'This document category is already a requirement for this rule set',
      );
    }

    const requirement = await this.requirementsRepository.insert({
      organizationId,
      ruleSetId,
      documentCategoryId: dto.documentCategoryId,
      isRequired: dto.isRequired ?? true,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.COMPLIANCE_DOCUMENT_REQUIREMENT_CREATED,
      resource: 'document_requirement',
      resourceId: requirement.id,
      metadata: {
        ruleSetId,
        documentCategoryId: dto.documentCategoryId,
        isRequired: requirement.isRequired,
      },
    });

    return requirement;
  }

  async getById(id: string, organizationId: string): Promise<DocumentRequirementRecord> {
    const req = await this.requirementsRepository.findById(id);

    if (!req || req.organizationId !== organizationId) {
      throw new NotFoundException(`Document requirement ${id} not found`);
    }

    return req;
  }

  async update(
    id: string,
    organizationId: string,
    dto: UpdateDocumentRequirementDto,
    actorId: string,
  ): Promise<DocumentRequirementRecord> {
    await this.getById(id, organizationId);

    const updated = await this.requirementsRepository.update(id, organizationId, dto);

    if (!updated) {
      throw new NotFoundException(`Document requirement ${id} not found`);
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.COMPLIANCE_DOCUMENT_REQUIREMENT_UPDATED,
      resource: 'document_requirement',
      resourceId: id,
      metadata: { changedFields: dto },
    });

    return updated;
  }

  async delete(id: string, organizationId: string, actorId: string): Promise<void> {
    const req = await this.getById(id, organizationId);

    await this.requirementsRepository.delete(id, organizationId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.COMPLIANCE_DOCUMENT_REQUIREMENT_DELETED,
      resource: 'document_requirement',
      resourceId: id,
      metadata: {
        ruleSetId: req.ruleSetId,
        documentCategoryId: req.documentCategoryId,
      },
    });
  }
}
