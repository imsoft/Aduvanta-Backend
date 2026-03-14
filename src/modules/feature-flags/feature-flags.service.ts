import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  FeatureFlagsRepository,
  type FeatureFlagRecord,
} from './feature-flags.repository.js';
import type { CreateFeatureFlagDto } from './dto/create-feature-flag.dto.js';
import type { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto.js';

@Injectable()
export class FeatureFlagsService {
  constructor(
    private readonly featureFlagsRepository: FeatureFlagsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async list(organizationId: string): Promise<FeatureFlagRecord[]> {
    return this.featureFlagsRepository.findByOrganization(organizationId);
  }

  async create(
    organizationId: string,
    dto: CreateFeatureFlagDto,
    actorId: string,
  ): Promise<FeatureFlagRecord> {
    const existing = await this.featureFlagsRepository.findByKeyAndOrg(
      dto.key,
      organizationId,
    );

    if (existing) {
      throw new BadRequestException(
        `A feature flag with key "${dto.key}" already exists for this organization`,
      );
    }

    const flag = await this.featureFlagsRepository.insert({
      key: dto.key,
      description: dto.description ?? null,
      isEnabled: dto.isEnabled,
      organizationId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.FEATURE_FLAG_CREATED,
      resource: 'feature_flag',
      resourceId: flag.id,
      metadata: { key: flag.key, isEnabled: flag.isEnabled },
    });

    return flag;
  }

  async update(
    id: string,
    organizationId: string,
    dto: UpdateFeatureFlagDto,
    actorId: string,
  ): Promise<FeatureFlagRecord> {
    const flag = await this.assertOwnership(id, organizationId);

    const updated = await this.featureFlagsRepository.update(id, {
      isEnabled: dto.isEnabled ?? flag.isEnabled,
      description: dto.description !== undefined ? dto.description : flag.description,
    });

    if (!updated) {
      throw new NotFoundException(`Feature flag ${id} not found after update`);
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.FEATURE_FLAG_UPDATED,
      resource: 'feature_flag',
      resourceId: id,
      metadata: { key: updated.key, isEnabled: updated.isEnabled },
    });

    return updated;
  }

  async delete(
    id: string,
    organizationId: string,
    actorId: string,
  ): Promise<void> {
    const flag = await this.assertOwnership(id, organizationId);

    await this.featureFlagsRepository.delete(id);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.FEATURE_FLAG_DELETED,
      resource: 'feature_flag',
      resourceId: id,
      metadata: { key: flag.key },
    });
  }

  private async assertOwnership(
    id: string,
    organizationId: string,
  ): Promise<FeatureFlagRecord> {
    const flag = await this.featureFlagsRepository.findById(id);

    if (!flag) {
      throw new NotFoundException(`Feature flag ${id} not found`);
    }

    // Global flags (null org) cannot be modified by org-scoped requests.
    if (flag.organizationId === null) {
      throw new ForbiddenException(
        'Global feature flags cannot be modified through the organization API',
      );
    }

    if (flag.organizationId !== organizationId) {
      throw new ForbiddenException(
        'Feature flag does not belong to the current organization',
      );
    }

    return flag;
  }
}
