import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import type { ClientRecord } from './clients.repository.js';
import { ClientsRepository } from './clients.repository.js';
import type { CreateClientDto } from './dto/create-client.dto.js';
import type { ListClientsDto } from './dto/list-clients.dto.js';
import type { UpdateClientDto } from './dto/update-client.dto.js';

@Injectable()
export class ClientsService {
  constructor(
    private readonly clientsRepository: ClientsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(
    organizationId: string,
    dto: CreateClientDto,
    actorId: string,
  ): Promise<ClientRecord> {
    const client = await this.clientsRepository.insert({
      ...dto,
      organizationId,
      createdById: actorId,
      status: 'ACTIVE',
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CLIENT_CREATED,
      resource: 'client',
      resourceId: client.id,
      metadata: { name: client.name },
    });

    return client;
  }

  async list(
    organizationId: string,
    dto: ListClientsDto,
  ): Promise<ClientRecord[]> {
    return this.clientsRepository.findByOrganization({
      organizationId,
      search: dto.search,
      status: dto.status,
      limit: dto.limit,
      offset: dto.offset,
    });
  }

  async getById(id: string, organizationId: string): Promise<ClientRecord> {
    const client = await this.clientsRepository.findById(id);

    if (!client || client.organizationId !== organizationId) {
      throw new NotFoundException(`Client ${id} not found`);
    }

    return client;
  }

  async update(
    id: string,
    organizationId: string,
    dto: UpdateClientDto,
    actorId: string,
  ): Promise<ClientRecord> {
    await this.getById(id, organizationId);

    const updated = await this.clientsRepository.update(
      id,
      organizationId,
      dto,
    );

    if (!updated) {
      throw new NotFoundException(`Client ${id} not found`);
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CLIENT_UPDATED,
      resource: 'client',
      resourceId: id,
      metadata: { changes: dto },
    });

    return updated;
  }

  async deactivate(
    id: string,
    organizationId: string,
    actorId: string,
  ): Promise<void> {
    await this.getById(id, organizationId);

    await this.clientsRepository.update(id, organizationId, {
      status: 'INACTIVE',
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CLIENT_DELETED,
      resource: 'client',
      resourceId: id,
      metadata: {},
    });
  }
}
