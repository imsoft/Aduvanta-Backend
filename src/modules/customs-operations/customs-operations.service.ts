import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  CustomsOperationsRepository,
  type ShipmentRecord,
  type ShipmentStageRecord,
  type ShipmentCommentRecord,
} from './customs-operations.repository.js';
import type { CreateShipmentDto } from './dto/create-shipment.dto.js';
import type { UpdateShipmentDto } from './dto/update-shipment.dto.js';
import type { ChangeShipmentStatusDto } from './dto/change-shipment-status.dto.js';
import type { AddShipmentStageDto } from './dto/add-shipment-stage.dto.js';
import type { AddShipmentCommentDto } from './dto/add-shipment-comment.dto.js';
import type { LinkEntryDto } from './dto/link-entry.dto.js';

@Injectable()
export class CustomsOperationsService {
  constructor(
    private readonly repository: CustomsOperationsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  // --- Shipments ---

  async listShipments(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ shipments: ShipmentRecord[]; total: number }> {
    return this.repository.findShipmentsByOrganization(
      organizationId,
      limit,
      offset,
    );
  }

  async searchShipments(
    organizationId: string,
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ shipments: ShipmentRecord[]; total: number }> {
    return this.repository.searchShipments(
      organizationId,
      query,
      limit,
      offset,
    );
  }

  async getShipmentById(
    id: string,
    organizationId: string,
  ): Promise<ShipmentRecord> {
    const shipment = await this.repository.findShipmentByIdAndOrg(
      id,
      organizationId,
    );

    if (!shipment) {
      throw new NotFoundException(`Shipment ${id} not found`);
    }

    return shipment;
  }

  async getShipmentDetails(id: string, organizationId: string) {
    const shipment = await this.getShipmentById(id, organizationId);
    const [stages, entries, comments] = await Promise.all([
      this.repository.findStagesByShipment(id),
      this.repository.findEntriesByShipment(id),
      this.repository.findCommentsByShipment(id),
    ]);

    return {
      ...shipment,
      stages,
      entries: entries.map(({ link, entry }) => ({
        ...link,
        entry,
      })),
      comments,
    };
  }

  async createShipment(
    dto: CreateShipmentDto,
    actorId: string,
    organizationId: string,
  ): Promise<ShipmentRecord> {
    const shipment = await this.repository.insertShipment({
      organizationId,
      ...dto,
      createdById: actorId,
      status: 'PENDING',
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.SHIPMENT_CREATED,
      resource: 'shipment',
      resourceId: shipment.id,
      metadata: {
        trackingNumber: shipment.trackingNumber,
        type: shipment.type,
      },
    });

    return shipment;
  }

  async updateShipment(
    id: string,
    dto: UpdateShipmentDto,
    actorId: string,
    organizationId: string,
  ): Promise<ShipmentRecord> {
    await this.getShipmentById(id, organizationId);

    const updated = await this.repository.updateShipment(id, {
      ...dto,
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.SHIPMENT_UPDATED,
      resource: 'shipment',
      resourceId: id,
      metadata: { ...dto },
    });

    return updated;
  }

  async deleteShipment(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const shipment = await this.getShipmentById(id, organizationId);

    if (shipment.status !== 'PENDING' && shipment.status !== 'CANCELLED') {
      throw new BadRequestException(
        'Only pending or cancelled shipments can be deleted',
      );
    }

    await this.repository.deleteShipment(id);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.SHIPMENT_DELETED,
      resource: 'shipment',
      resourceId: id,
      metadata: { trackingNumber: shipment.trackingNumber },
    });
  }

  async changeStatus(
    id: string,
    dto: ChangeShipmentStatusDto,
    actorId: string,
    organizationId: string,
  ): Promise<ShipmentRecord> {
    const shipment = await this.getShipmentById(id, organizationId);

    const updated = await this.repository.updateShipment(id, {
      status: dto.status,
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.SHIPMENT_STATUS_CHANGED,
      resource: 'shipment',
      resourceId: id,
      metadata: {
        previousStatus: shipment.status,
        newStatus: dto.status,
        reason: dto.reason,
      },
    });

    return updated;
  }

  // --- Stages ---

  async listStages(
    shipmentId: string,
    organizationId: string,
  ): Promise<ShipmentStageRecord[]> {
    await this.getShipmentById(shipmentId, organizationId);
    return this.repository.findStagesByShipment(shipmentId);
  }

  async addStage(
    shipmentId: string,
    dto: AddShipmentStageDto,
    actorId: string,
    organizationId: string,
  ): Promise<ShipmentStageRecord> {
    await this.getShipmentById(shipmentId, organizationId);

    const stage = await this.repository.insertStage({
      shipmentId,
      stageName: dto.stageName,
      stageLabel: dto.stageLabel,
      startedAt: new Date(dto.startedAt),
      location: dto.location,
      performedById: actorId,
      notes: dto.notes,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.SHIPMENT_STAGE_ADDED,
      resource: 'shipment_stage',
      resourceId: stage.id,
      metadata: {
        shipmentId,
        stageName: stage.stageName,
        stageLabel: stage.stageLabel,
      },
    });

    return stage;
  }

  async completeStage(
    shipmentId: string,
    stageId: string,
    actorId: string,
    organizationId: string,
  ): Promise<ShipmentStageRecord> {
    await this.getShipmentById(shipmentId, organizationId);

    const stage = await this.repository.findStageById(stageId);
    if (!stage || stage.shipmentId !== shipmentId) {
      throw new NotFoundException(`Stage ${stageId} not found in shipment`);
    }

    if (stage.completedAt) {
      throw new BadRequestException('Stage is already completed');
    }

    const completed = await this.repository.completeStage(stageId, new Date());

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.SHIPMENT_STAGE_COMPLETED,
      resource: 'shipment_stage',
      resourceId: stageId,
      metadata: {
        shipmentId,
        stageName: stage.stageName,
        completedAt: completed.completedAt,
      },
    });

    return completed;
  }

  // --- Entry Links ---

  async listLinkedEntries(shipmentId: string, organizationId: string) {
    await this.getShipmentById(shipmentId, organizationId);
    const entries = await this.repository.findEntriesByShipment(shipmentId);
    return entries.map(({ link, entry }) => ({ ...link, entry }));
  }

  async linkEntry(
    shipmentId: string,
    dto: LinkEntryDto,
    actorId: string,
    organizationId: string,
  ) {
    await this.getShipmentById(shipmentId, organizationId);

    const link = await this.repository.insertShipmentEntry({
      shipmentId,
      entryId: dto.entryId,
      relationship: dto.relationship ?? 'PRIMARY',
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.SHIPMENT_ENTRY_LINKED,
      resource: 'shipment_entry',
      resourceId: link.id,
      metadata: {
        shipmentId,
        entryId: dto.entryId,
        relationship: link.relationship,
      },
    });

    return link;
  }

  async unlinkEntry(
    shipmentId: string,
    linkId: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    await this.getShipmentById(shipmentId, organizationId);
    await this.repository.deleteShipmentEntry(linkId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.SHIPMENT_ENTRY_UNLINKED,
      resource: 'shipment_entry',
      resourceId: linkId,
      metadata: { shipmentId },
    });
  }

  // --- Comments ---

  async listComments(
    shipmentId: string,
    organizationId: string,
  ): Promise<ShipmentCommentRecord[]> {
    await this.getShipmentById(shipmentId, organizationId);
    return this.repository.findCommentsByShipment(shipmentId);
  }

  async addComment(
    shipmentId: string,
    dto: AddShipmentCommentDto,
    actorId: string,
    actorName: string,
    organizationId: string,
  ): Promise<ShipmentCommentRecord> {
    await this.getShipmentById(shipmentId, organizationId);

    const comment = await this.repository.insertComment({
      shipmentId,
      authorId: actorId,
      authorName: actorName,
      content: dto.content,
      visibleToClient: dto.visibleToClient ?? 'false',
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.SHIPMENT_COMMENT_ADDED,
      resource: 'shipment_comment',
      resourceId: comment.id,
      metadata: { shipmentId, visibleToClient: comment.visibleToClient },
    });

    return comment;
  }
}
