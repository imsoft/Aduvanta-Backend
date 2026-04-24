import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  CustomsPreviosRepository,
  type PrevioRecord,
} from './customs-previos.repository.js';
import type { CreatePrevioDto } from './dto/create-previo.dto.js';
import type { CompletePrevioDto } from './dto/complete-previo.dto.js';

@Injectable()
export class CustomsPreviosService {
  constructor(
    private readonly repository: CustomsPreviosRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async listPrevios(
    organizationId: string,
    limit: number,
    offset: number,
    filters: { entryId?: string; status?: string; q?: string } = {},
  ) {
    return this.repository.findByOrganization(
      organizationId,
      limit,
      offset,
      filters,
    );
  }

  async getPrevioById(id: string, organizationId: string) {
    const previo = await this.repository.findByOrganizationAndId(
      id,
      organizationId,
    );

    if (!previo) {
      throw new NotFoundException(`Previo ${id} not found`);
    }

    const items = await this.repository.findItemsByPrevio(id);

    return { ...previo, items };
  }

  async createPrevio(
    dto: CreatePrevioDto,
    actorId: string,
    organizationId: string,
  ): Promise<PrevioRecord> {
    const previo = await this.repository.insert({
      organizationId,
      previoNumber: dto.previoNumber,
      type: dto.type,
      entryId: dto.entryId,
      shipmentId: dto.shipmentId,
      warehouseName: dto.warehouseName,
      warehouseAddress: dto.warehouseAddress,
      customsOfficeId: dto.customsOfficeId,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      inspectorName: dto.inspectorName,
      supervisorName: dto.supervisorName,
      declaredPackages: dto.declaredPackages,
      declaredGrossWeightKg: dto.declaredGrossWeightKg,
      containerNumbers: dto.containerNumbers,
      sealNumbers: dto.sealNumbers,
      sealIntact: dto.sealIntact,
      internalNotes: dto.internalNotes,
      createdById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.PREVIO_CREATED,
      resource: 'customs_previo',
      resourceId: previo.id,
      metadata: {
        previoNumber: dto.previoNumber,
        type: dto.type,
        entryId: dto.entryId,
      },
    });

    return previo;
  }

  async completePrevio(
    id: string,
    dto: CompletePrevioDto,
    actorId: string,
    organizationId: string,
  ): Promise<PrevioRecord> {
    await this.getPrevioById(id, organizationId);

    const updated = await this.repository.update(id, {
      status: 'COMPLETED',
      startedAt: new Date(dto.startedAt),
      completedAt: new Date(dto.completedAt),
      foundPackages: dto.foundPackages,
      foundGrossWeightKg: dto.foundGrossWeightKg,
      packageDiscrepancy: dto.packageDiscrepancy,
      discrepanciesFound: dto.discrepanciesFound,
      discrepancyNotes: dto.discrepancyNotes,
      photographsTaken: dto.photographsTaken,
      photographCount: dto.photographCount ?? 0,
      reportFileKey: dto.reportFileKey,
      internalNotes: dto.internalNotes,
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.PREVIO_COMPLETED,
      resource: 'customs_previo',
      resourceId: id,
      metadata: {
        discrepanciesFound: dto.discrepanciesFound,
        foundPackages: dto.foundPackages,
      },
    });

    return updated;
  }

  async cancelPrevio(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<PrevioRecord> {
    const previo = await this.getPrevioById(id, organizationId);

    if (previo.status === 'COMPLETED') {
      throw new NotFoundException(
        'Cannot cancel a completed previo',
      );
    }

    const updated = await this.repository.update(id, {
      status: 'CANCELLED',
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.PREVIO_CANCELLED,
      resource: 'customs_previo',
      resourceId: id,
      metadata: {},
    });

    return updated;
  }
}
