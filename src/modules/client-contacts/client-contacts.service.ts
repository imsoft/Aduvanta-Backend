import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import { ClientsService } from '../clients/clients.service.js';
import type { ClientContactRecord } from './client-contacts.repository.js';
import { ClientContactsRepository } from './client-contacts.repository.js';
import type { CreateClientContactDto } from './dto/create-client-contact.dto.js';
import type { UpdateClientContactDto } from './dto/update-client-contact.dto.js';

@Injectable()
export class ClientContactsService {
  constructor(
    private readonly contactsRepository: ClientContactsRepository,
    private readonly clientsService: ClientsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async list(
    clientId: string,
    organizationId: string,
  ): Promise<ClientContactRecord[]> {
    // Validates client belongs to org before returning contacts.
    await this.clientsService.getById(clientId, organizationId);
    return this.contactsRepository.findByClient(clientId, organizationId);
  }

  async create(
    clientId: string,
    organizationId: string,
    dto: CreateClientContactDto,
    actorId: string,
  ): Promise<ClientContactRecord> {
    await this.clientsService.getById(clientId, organizationId);

    if (dto.isPrimary) {
      await this.contactsRepository.clearPrimary(clientId, organizationId);
    }

    const contact = await this.contactsRepository.insert({
      ...dto,
      clientId,
      organizationId,
      isPrimary: dto.isPrimary ?? false,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CLIENT_CONTACT_CREATED,
      resource: 'client_contact',
      resourceId: contact.id,
      metadata: { clientId, name: contact.name },
    });

    return contact;
  }

  async update(
    clientId: string,
    contactId: string,
    organizationId: string,
    dto: UpdateClientContactDto,
    actorId: string,
  ): Promise<ClientContactRecord> {
    await this.clientsService.getById(clientId, organizationId);

    const existing = await this.contactsRepository.findById(contactId);

    if (
      !existing ||
      existing.clientId !== clientId ||
      existing.organizationId !== organizationId
    ) {
      throw new NotFoundException(`Contact ${contactId} not found`);
    }

    if (dto.isPrimary) {
      await this.contactsRepository.clearPrimary(clientId, organizationId);
    }

    const updated = await this.contactsRepository.update(
      contactId,
      organizationId,
      dto,
    );

    if (!updated) {
      throw new NotFoundException(`Contact ${contactId} not found`);
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CLIENT_CONTACT_UPDATED,
      resource: 'client_contact',
      resourceId: contactId,
      metadata: { clientId, changes: dto },
    });

    return updated;
  }

  async remove(
    clientId: string,
    contactId: string,
    organizationId: string,
    actorId: string,
  ): Promise<void> {
    await this.clientsService.getById(clientId, organizationId);

    const existing = await this.contactsRepository.findById(contactId);

    if (
      !existing ||
      existing.clientId !== clientId ||
      existing.organizationId !== organizationId
    ) {
      throw new NotFoundException(`Contact ${contactId} not found`);
    }

    await this.contactsRepository.delete(contactId, organizationId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CLIENT_CONTACT_DELETED,
      resource: 'client_contact',
      resourceId: contactId,
      metadata: { clientId },
    });
  }
}
