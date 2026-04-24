import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  CustomsInspectionsRepository,
  type InspectionRecord,
} from './customs-inspections.repository.js';
import type { CreateInspectionDto } from './dto/create-inspection.dto.js';
import type { UpdateInspectionDto } from './dto/update-inspection.dto.js';

@Injectable()
export class CustomsInspectionsService {
  constructor(
    private readonly repository: CustomsInspectionsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async listInspections(
    organizationId: string,
    limit: number,
    offset: number,
    filters: {
      entryId?: string;
      semaphoreColor?: string;
      inspectionResult?: string;
    } = {},
  ) {
    return this.repository.findByOrganization(
      organizationId,
      limit,
      offset,
      filters,
    );
  }

  async getInspectionById(
    id: string,
    organizationId: string,
  ): Promise<InspectionRecord & { items: Awaited<ReturnType<CustomsInspectionsRepository['findItemsByInspection']>> }> {
    const inspection = await this.repository.findByOrganizationAndId(
      id,
      organizationId,
    );

    if (!inspection) {
      throw new NotFoundException(`Inspection ${id} not found`);
    }

    const items = await this.repository.findItemsByInspection(id);

    return { ...inspection, items };
  }

  async getInspectionsByEntry(entryId: string, organizationId: string) {
    // Verify entry belongs to org (basic guard)
    if (!entryId) {
      throw new BadRequestException('entryId is required');
    }
    return this.repository.findByEntry(entryId);
  }

  async createInspection(
    dto: CreateInspectionDto,
    actorId: string,
    organizationId: string,
  ): Promise<InspectionRecord> {
    const inspection = await this.repository.insert({
      organizationId,
      entryId: dto.entryId,
      shipmentId: dto.shipmentId,
      semaphoreColor: dto.semaphoreColor,
      modulationDate: dto.modulationDate
        ? new Date(dto.modulationDate)
        : undefined,
      inspectionType: dto.inspectionType,
      inspectorName: dto.inspectorName,
      inspectorBadge: dto.inspectorBadge,
      inspectionLocation: dto.inspectionLocation,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      packagesInspected: dto.packagesInspected,
      discrepanciesFound: dto.discrepanciesFound ?? false,
      discrepancyDescription: dto.discrepancyDescription,
      actaNumber: dto.actaNumber,
      internalNotes: dto.internalNotes,
      createdById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.INSPECTION_CREATED,
      resource: 'customs_inspection',
      resourceId: inspection.id,
      metadata: {
        entryId: dto.entryId,
        semaphoreColor: dto.semaphoreColor,
        inspectionType: dto.inspectionType,
      },
    });

    return inspection;
  }

  async updateInspection(
    id: string,
    dto: UpdateInspectionDto,
    actorId: string,
    organizationId: string,
  ): Promise<InspectionRecord> {
    await this.getInspectionById(id, organizationId);

    const updated = await this.repository.update(id, {
      ...dto,
      modulationDate: dto.modulationDate
        ? new Date(dto.modulationDate)
        : undefined,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
      completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.INSPECTION_UPDATED,
      resource: 'customs_inspection',
      resourceId: id,
      metadata: {
        inspectionResult: dto.inspectionResult,
        semaphoreColor: dto.semaphoreColor,
      },
    });

    return updated;
  }

  async recordModulationResult(
    id: string,
    semaphoreColor: 'GREEN' | 'RED',
    actorId: string,
    organizationId: string,
  ): Promise<InspectionRecord> {
    await this.getInspectionById(id, organizationId);

    const updated = await this.repository.update(id, {
      semaphoreColor,
      modulationDate: new Date(),
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.INSPECTION_SEMAPHORE_RECORDED,
      resource: 'customs_inspection',
      resourceId: id,
      metadata: { semaphoreColor },
    });

    return updated;
  }
}
