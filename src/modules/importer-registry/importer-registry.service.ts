import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  ImporterRegistryRepository,
  type ImporterRegistryRecord,
} from './importer-registry.repository.js';
import type { CreateImporterRegistryDto } from './dto/create-registry.dto.js';
import type { UpdateImporterRegistryDto } from './dto/update-registry.dto.js';

@Injectable()
export class ImporterRegistryService {
  constructor(
    private readonly repository: ImporterRegistryRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async listImporters(
    organizationId: string,
    limit: number,
    offset: number,
    filters: { q?: string; status?: string; clientId?: string } = {},
  ) {
    return this.repository.findImportersByOrganization(
      organizationId,
      limit,
      offset,
      filters,
    );
  }

  async getImporterById(id: string, organizationId: string) {
    const registry = await this.repository.findImporterByOrganizationAndId(
      id,
      organizationId,
    );

    if (!registry) {
      throw new NotFoundException(`Importer registry ${id} not found`);
    }

    const sectors = await this.repository.findSectorsByRegistry(id);
    return { ...registry, sectors };
  }

  async getExpiringImporters(organizationId: string, withinDays = 60) {
    return this.repository.findExpiringImporters(organizationId, withinDays);
  }

  async createImporterRegistry(
    dto: CreateImporterRegistryDto,
    actorId: string,
    organizationId: string,
  ): Promise<ImporterRegistryRecord> {
    const registry = await this.repository.insertImporter({
      organizationId,
      clientId: dto.clientId,
      registryType: dto.registryType,
      rfc: dto.rfc,
      businessName: dto.businessName,
      inscriptionDate: dto.inscriptionDate,
      expirationDate: dto.expirationDate,
      satFolioNumber: dto.satFolioNumber,
      internalNotes: dto.internalNotes,
      createdById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.IMPORTER_REGISTRY_CREATED,
      resource: 'importer_registry',
      resourceId: registry.id,
      metadata: {
        rfc: dto.rfc,
        businessName: dto.businessName,
        registryType: dto.registryType,
      },
    });

    return registry;
  }

  async updateImporterRegistry(
    id: string,
    dto: UpdateImporterRegistryDto,
    actorId: string,
    organizationId: string,
  ): Promise<ImporterRegistryRecord> {
    await this.getImporterById(id, organizationId);

    const updated = await this.repository.updateImporter(id, {
      ...dto,
      suspensionDate: dto.suspensionDate,
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.IMPORTER_REGISTRY_UPDATED,
      resource: 'importer_registry',
      resourceId: id,
      metadata: { status: dto.status },
    });

    return updated;
  }

  async addSector(
    registryId: string,
    sectorCode: string,
    sectorName: string,
    inscriptionDate: string | undefined,
    expirationDate: string | undefined,
    actorId: string,
    organizationId: string,
  ) {
    await this.getImporterById(registryId, organizationId);

    const sector = await this.repository.insertSector({
      registryId,
      sectorCode,
      sectorName,
      inscriptionDate,
      expirationDate,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.IMPORTER_REGISTRY_UPDATED,
      resource: 'importer_registry',
      resourceId: registryId,
      metadata: { action: 'sector_added', sectorCode },
    });

    return sector;
  }

  async removeSector(
    registryId: string,
    sectorId: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    await this.getImporterById(registryId, organizationId);
    await this.repository.deleteSector(sectorId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.IMPORTER_REGISTRY_UPDATED,
      resource: 'importer_registry',
      resourceId: registryId,
      metadata: { action: 'sector_removed', sectorId },
    });
  }

  async listExporters(
    organizationId: string,
    limit: number,
    offset: number,
  ) {
    return this.repository.findExportersByOrganization(
      organizationId,
      limit,
      offset,
    );
  }
}
