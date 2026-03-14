import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import type { IntegrationRecord } from './integrations.repository.js';
import { IntegrationsRepository } from './integrations.repository.js';
import type { CreateIntegrationDto } from './dto/create-integration.dto.js';
import type { UpdateIntegrationDto } from './dto/update-integration.dto.js';
import type { ListIntegrationsDto } from './dto/list-integrations.dto.js';

// Secrets are stored as-is in V1 (plaintext marker).
// In a production hardening pass, replace with proper encryption.
function encodeSecret(secret: string): string {
  return secret;
}

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly integrationsRepository: IntegrationsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async list(
    organizationId: string,
    dto: ListIntegrationsDto,
  ): Promise<IntegrationRecord[]> {
    const records = await this.integrationsRepository.findByOrganization({
      organizationId,
      status: dto.status,
      provider: dto.provider,
    });

    return records.map((r) => this.sanitize(r));
  }

  async create(
    organizationId: string,
    dto: CreateIntegrationDto,
    actorId: string,
  ): Promise<IntegrationRecord> {
    const record = await this.integrationsRepository.insert({
      organizationId,
      provider: dto.provider,
      name: dto.name,
      status: 'ACTIVE',
      targetUrl: dto.targetUrl,
      secretEncrypted: dto.secret ? encodeSecret(dto.secret) : null,
      eventTypes: dto.eventTypes.join(','),
      createdById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.INTEGRATION_CREATED,
      resource: 'integration',
      resourceId: record.id,
      metadata: { provider: record.provider, name: record.name, eventTypes: dto.eventTypes },
    });

    return this.sanitize(record);
  }

  async getById(id: string, organizationId: string): Promise<IntegrationRecord> {
    const record = await this.integrationsRepository.findById(id);

    if (!record || record.organizationId !== organizationId) {
      throw new NotFoundException(`Integration ${id} not found`);
    }

    return this.sanitize(record);
  }

  async update(
    id: string,
    organizationId: string,
    dto: UpdateIntegrationDto,
    actorId: string,
  ): Promise<IntegrationRecord> {
    await this.getById(id, organizationId);

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.targetUrl !== undefined) data.targetUrl = dto.targetUrl;
    if (dto.secret !== undefined) data.secretEncrypted = encodeSecret(dto.secret);
    if (dto.eventTypes !== undefined) data.eventTypes = dto.eventTypes.join(',');
    if (dto.status !== undefined) data.status = dto.status;

    const updated = await this.integrationsRepository.update(id, organizationId, data);

    if (!updated) {
      throw new NotFoundException(`Integration ${id} not found`);
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.INTEGRATION_UPDATED,
      resource: 'integration',
      resourceId: id,
      metadata: { changedFields: Object.keys(data) },
    });

    return this.sanitize(updated);
  }

  async deactivate(id: string, organizationId: string, actorId: string): Promise<void> {
    await this.getById(id, organizationId);

    await this.integrationsRepository.update(id, organizationId, { status: 'INACTIVE' });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.INTEGRATION_DELETED,
      resource: 'integration',
      resourceId: id,
      metadata: {},
    });
  }

  // Remove the encrypted secret from responses — never return raw secrets.
  private sanitize(record: IntegrationRecord): IntegrationRecord {
    return {
      ...record,
      secretEncrypted: record.secretEncrypted ? '***' : null,
    };
  }
}
