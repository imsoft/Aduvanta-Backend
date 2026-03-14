import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import { ClientsService } from '../clients/clients.service.js';
import type { ClientAddressRecord } from './client-addresses.repository.js';
import { ClientAddressesRepository } from './client-addresses.repository.js';
import type { CreateClientAddressDto } from './dto/create-client-address.dto.js';
import type { UpdateClientAddressDto } from './dto/update-client-address.dto.js';

@Injectable()
export class ClientAddressesService {
  constructor(
    private readonly addressesRepository: ClientAddressesRepository,
    private readonly clientsService: ClientsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async list(
    clientId: string,
    organizationId: string,
  ): Promise<ClientAddressRecord[]> {
    await this.clientsService.getById(clientId, organizationId);
    return this.addressesRepository.findByClient(clientId, organizationId);
  }

  async create(
    clientId: string,
    organizationId: string,
    dto: CreateClientAddressDto,
    actorId: string,
  ): Promise<ClientAddressRecord> {
    await this.clientsService.getById(clientId, organizationId);

    if (dto.isPrimary) {
      await this.addressesRepository.clearPrimary(clientId, organizationId);
    }

    const address = await this.addressesRepository.insert({
      ...dto,
      clientId,
      organizationId,
      isPrimary: dto.isPrimary ?? false,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CLIENT_ADDRESS_CREATED,
      resource: 'client_address',
      resourceId: address.id,
      metadata: { clientId, label: address.label },
    });

    return address;
  }

  async update(
    clientId: string,
    addressId: string,
    organizationId: string,
    dto: UpdateClientAddressDto,
    actorId: string,
  ): Promise<ClientAddressRecord> {
    await this.clientsService.getById(clientId, organizationId);

    const existing = await this.addressesRepository.findById(addressId);

    if (
      !existing ||
      existing.clientId !== clientId ||
      existing.organizationId !== organizationId
    ) {
      throw new NotFoundException(`Address ${addressId} not found`);
    }

    if (dto.isPrimary) {
      await this.addressesRepository.clearPrimary(clientId, organizationId);
    }

    const updated = await this.addressesRepository.update(
      addressId,
      organizationId,
      dto,
    );

    if (!updated) {
      throw new NotFoundException(`Address ${addressId} not found`);
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CLIENT_ADDRESS_UPDATED,
      resource: 'client_address',
      resourceId: addressId,
      metadata: { clientId, changes: dto },
    });

    return updated;
  }

  async remove(
    clientId: string,
    addressId: string,
    organizationId: string,
    actorId: string,
  ): Promise<void> {
    await this.clientsService.getById(clientId, organizationId);

    const existing = await this.addressesRepository.findById(addressId);

    if (
      !existing ||
      existing.clientId !== clientId ||
      existing.organizationId !== organizationId
    ) {
      throw new NotFoundException(`Address ${addressId} not found`);
    }

    await this.addressesRepository.delete(addressId, organizationId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CLIENT_ADDRESS_DELETED,
      resource: 'client_address',
      resourceId: addressId,
      metadata: { clientId },
    });
  }
}
