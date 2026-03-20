import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import type { RuleSetRecord } from './compliance-rule-sets.repository.js';
import { ComplianceRuleSetsRepository } from './compliance-rule-sets.repository.js';
import type { CreateRuleSetDto } from './dto/create-rule-set.dto.js';
import type { UpdateRuleSetDto } from './dto/update-rule-set.dto.js';
import type { ListRuleSetsDto } from './dto/list-rule-sets.dto.js';

@Injectable()
export class ComplianceRuleSetsService {
  constructor(
    private readonly ruleSetRepository: ComplianceRuleSetsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async list(
    organizationId: string,
    dto: ListRuleSetsDto,
  ): Promise<RuleSetRecord[]> {
    return this.ruleSetRepository.findByOrganization({
      organizationId,
      operationType: dto.operationType,
      isActive: dto.isActive,
    });
  }

  async create(
    organizationId: string,
    dto: CreateRuleSetDto,
    actorId: string,
  ): Promise<RuleSetRecord> {
    const existing = await this.ruleSetRepository.findByCodeAndOrg(
      dto.code,
      organizationId,
    );
    if (existing) {
      throw new ConflictException(
        `A rule set with code "${dto.code}" already exists in this organization`,
      );
    }

    const ruleSet = await this.ruleSetRepository.insert({
      organizationId,
      name: dto.name,
      code: dto.code,
      operationType: dto.operationType,
      isActive: dto.isActive ?? true,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.COMPLIANCE_RULE_SET_CREATED,
      resource: 'rule_set',
      resourceId: ruleSet.id,
      metadata: {
        name: ruleSet.name,
        code: ruleSet.code,
        operationType: ruleSet.operationType,
      },
    });

    return ruleSet;
  }

  async getById(id: string, organizationId: string): Promise<RuleSetRecord> {
    const ruleSet = await this.ruleSetRepository.findById(id);

    if (!ruleSet || ruleSet.organizationId !== organizationId) {
      throw new NotFoundException(`Rule set ${id} not found`);
    }

    return ruleSet;
  }

  async update(
    id: string,
    organizationId: string,
    dto: UpdateRuleSetDto,
    actorId: string,
  ): Promise<RuleSetRecord> {
    await this.getById(id, organizationId);

    if (dto.code) {
      const existing = await this.ruleSetRepository.findByCodeAndOrg(
        dto.code,
        organizationId,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `A rule set with code "${dto.code}" already exists in this organization`,
        );
      }
    }

    const updated = await this.ruleSetRepository.update(
      id,
      organizationId,
      dto,
    );

    if (!updated) {
      throw new NotFoundException(`Rule set ${id} not found`);
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.COMPLIANCE_RULE_SET_UPDATED,
      resource: 'rule_set',
      resourceId: id,
      metadata: { changedFields: dto },
    });

    return updated;
  }

  async delete(
    id: string,
    organizationId: string,
    actorId: string,
  ): Promise<void> {
    const ruleSet = await this.getById(id, organizationId);

    await this.ruleSetRepository.delete(id, organizationId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.COMPLIANCE_RULE_SET_DELETED,
      resource: 'rule_set',
      resourceId: id,
      metadata: {
        name: ruleSet.name,
        code: ruleSet.code,
        operationType: ruleSet.operationType,
      },
    });
  }
}
