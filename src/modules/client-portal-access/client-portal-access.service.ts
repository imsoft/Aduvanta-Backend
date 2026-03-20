import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import { ClientsService } from '../clients/clients.service.js';
import type { ClientPortalAccessRecord } from './client-portal-access.repository.js';
import { ClientPortalAccessRepository } from './client-portal-access.repository.js';
import type { GrantPortalAccessDto } from './dto/grant-portal-access.dto.js';

@Injectable()
export class ClientPortalAccessService {
  constructor(
    private readonly portalAccessRepository: ClientPortalAccessRepository,
    private readonly clientsService: ClientsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async listForClient(
    clientId: string,
    organizationId: string,
  ): Promise<ClientPortalAccessRecord[]> {
    // Validate client belongs to org.
    await this.clientsService.getById(clientId, organizationId);
    return this.portalAccessRepository.findByClientAndOrg(
      clientId,
      organizationId,
    );
  }

  async grant(
    organizationId: string,
    dto: GrantPortalAccessDto,
    actorId: string,
  ): Promise<ClientPortalAccessRecord> {
    // Validate client belongs to org.
    await this.clientsService.getById(dto.clientId, organizationId);

    // Prevent duplicate access entries.
    const existing = await this.portalAccessRepository.findByUserClientAndOrg(
      dto.userId,
      dto.clientId,
      organizationId,
    );

    if (existing) {
      throw new ConflictException(
        `User ${dto.userId} already has portal access to client ${dto.clientId}`,
      );
    }

    const access = await this.portalAccessRepository.insert({
      organizationId,
      clientId: dto.clientId,
      userId: dto.userId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.PORTAL_ACCESS_GRANTED,
      resource: 'client_portal_access',
      resourceId: access.id,
      metadata: { clientId: dto.clientId, userId: dto.userId },
    });

    return access;
  }

  async revoke(
    accessId: string,
    organizationId: string,
    actorId: string,
  ): Promise<void> {
    const access = await this.portalAccessRepository.findById(accessId);

    if (!access || access.organizationId !== organizationId) {
      throw new NotFoundException(`Portal access ${accessId} not found`);
    }

    await this.portalAccessRepository.deleteById(accessId, organizationId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.PORTAL_ACCESS_REVOKED,
      resource: 'client_portal_access',
      resourceId: accessId,
      metadata: { clientId: access.clientId, userId: access.userId },
    });
  }
}
