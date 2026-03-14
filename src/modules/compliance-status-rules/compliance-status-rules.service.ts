import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import { ComplianceRuleSetsService } from '../compliance-rule-sets/compliance-rule-sets.service.js';
import type { StatusTransitionRuleRecord } from './compliance-status-rules.repository.js';
import { ComplianceStatusRulesRepository } from './compliance-status-rules.repository.js';
import type { CreateStatusTransitionRuleDto } from './dto/create-status-transition-rule.dto.js';
import type { UpdateStatusTransitionRuleDto } from './dto/update-status-transition-rule.dto.js';

@Injectable()
export class ComplianceStatusRulesService {
  constructor(
    private readonly statusRulesRepository: ComplianceStatusRulesRepository,
    private readonly ruleSetsService: ComplianceRuleSetsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async listForRuleSet(
    ruleSetId: string,
    organizationId: string,
  ): Promise<StatusTransitionRuleRecord[]> {
    await this.ruleSetsService.getById(ruleSetId, organizationId);
    return this.statusRulesRepository.findByRuleSet(ruleSetId, organizationId);
  }

  async create(
    ruleSetId: string,
    organizationId: string,
    dto: CreateStatusTransitionRuleDto,
    actorId: string,
  ): Promise<StatusTransitionRuleRecord> {
    await this.ruleSetsService.getById(ruleSetId, organizationId);

    const existing = await this.statusRulesRepository.findByRuleSetAndTransition(
      ruleSetId,
      dto.fromStatus,
      dto.toStatus,
    );
    if (existing) {
      throw new ConflictException(
        `A status rule for ${dto.fromStatus} → ${dto.toStatus} already exists in this rule set`,
      );
    }

    const rule = await this.statusRulesRepository.insert({
      organizationId,
      ruleSetId,
      fromStatus: dto.fromStatus,
      toStatus: dto.toStatus,
      requiresAllRequiredDocuments: dto.requiresAllRequiredDocuments ?? false,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.COMPLIANCE_STATUS_RULE_CREATED,
      resource: 'status_transition_rule',
      resourceId: rule.id,
      metadata: {
        ruleSetId,
        fromStatus: rule.fromStatus,
        toStatus: rule.toStatus,
        requiresAllRequiredDocuments: rule.requiresAllRequiredDocuments,
      },
    });

    return rule;
  }

  async getById(id: string, organizationId: string): Promise<StatusTransitionRuleRecord> {
    const rule = await this.statusRulesRepository.findById(id);

    if (!rule || rule.organizationId !== organizationId) {
      throw new NotFoundException(`Status transition rule ${id} not found`);
    }

    return rule;
  }

  async update(
    id: string,
    organizationId: string,
    dto: UpdateStatusTransitionRuleDto,
    actorId: string,
  ): Promise<StatusTransitionRuleRecord> {
    await this.getById(id, organizationId);

    const updated = await this.statusRulesRepository.update(id, organizationId, dto);

    if (!updated) {
      throw new NotFoundException(`Status transition rule ${id} not found`);
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.COMPLIANCE_STATUS_RULE_UPDATED,
      resource: 'status_transition_rule',
      resourceId: id,
      metadata: { changedFields: dto },
    });

    return updated;
  }

  async delete(id: string, organizationId: string, actorId: string): Promise<void> {
    const rule = await this.getById(id, organizationId);

    await this.statusRulesRepository.delete(id, organizationId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.COMPLIANCE_STATUS_RULE_DELETED,
      resource: 'status_transition_rule',
      resourceId: id,
      metadata: {
        ruleSetId: rule.ruleSetId,
        fromStatus: rule.fromStatus,
        toStatus: rule.toStatus,
      },
    });
  }
}
