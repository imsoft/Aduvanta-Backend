import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  CustomsRectificationsRepository,
  type RectificationRecord,
} from './customs-rectifications.repository.js';
import type { CreateRectificationDto } from './dto/create-rectification.dto.js';

@Injectable()
export class CustomsRectificationsService {
  constructor(
    private readonly repository: CustomsRectificationsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async listRectifications(
    organizationId: string,
    limit: number,
    offset: number,
    filters: { originalEntryId?: string } = {},
  ) {
    return this.repository.findByOrganization(
      organizationId,
      limit,
      offset,
      filters,
    );
  }

  async getRectificationById(id: string, organizationId: string) {
    const rectification = await this.repository.findByOrganizationAndId(
      id,
      organizationId,
    );

    if (!rectification) {
      throw new NotFoundException(`Rectification ${id} not found`);
    }

    const fieldChanges = await this.repository.findFieldChanges(id);
    return { ...rectification, fieldChanges };
  }

  async getRectificationsByEntry(originalEntryId: string) {
    return this.repository.findByOriginalEntry(originalEntryId);
  }

  async createRectification(
    dto: CreateRectificationDto,
    actorId: string,
    organizationId: string,
  ): Promise<RectificationRecord> {
    const existingCount = await this.repository.countByOriginalEntry(
      dto.originalEntryId,
    );

    const rectification = await this.repository.insert({
      organizationId,
      originalEntryId: dto.originalEntryId,
      reason: dto.reason,
      reasonDescription: dto.reasonDescription,
      sequenceNumber: existingCount + 1,
      internalNotes: dto.internalNotes,
      createdById: actorId,
    });

    if (dto.fieldChanges && dto.fieldChanges.length > 0) {
      await this.repository.insertFieldChanges(
        dto.fieldChanges.map((fc) => ({
          rectificationId: rectification.id,
          fieldPath: fc.fieldPath,
          fieldLabel: fc.fieldLabel,
          oldValue: fc.oldValue,
          newValue: fc.newValue,
        })),
      );
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.RECTIFICATION_CREATED,
      resource: 'customs_rectification',
      resourceId: rectification.id,
      metadata: {
        originalEntryId: dto.originalEntryId,
        reason: dto.reason,
        sequenceNumber: rectification.sequenceNumber,
      },
    });

    return rectification;
  }

  async submitRectification(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<RectificationRecord> {
    const rectification = await this.getRectificationById(id, organizationId);

    if (rectification.status !== 'DRAFT') {
      throw new BadRequestException(
        `Rectification ${id} is not in DRAFT status`,
      );
    }

    const updated = await this.repository.update(id, {
      status: 'SUBMITTED',
      filedAt: new Date(),
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.RECTIFICATION_SUBMITTED,
      resource: 'customs_rectification',
      resourceId: id,
      metadata: { originalEntryId: rectification.originalEntryId },
    });

    return updated;
  }

  async approveRectification(
    id: string,
    satAcknowledgmentNumber: string,
    actorId: string,
    organizationId: string,
  ): Promise<RectificationRecord> {
    await this.getRectificationById(id, organizationId);

    const updated = await this.repository.update(id, {
      status: 'APPROVED',
      approvedAt: new Date(),
      satAcknowledgmentNumber,
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.RECTIFICATION_APPROVED,
      resource: 'customs_rectification',
      resourceId: id,
      metadata: { satAcknowledgmentNumber },
    });

    return updated;
  }

  async rejectRectification(
    id: string,
    rejectionReason: string,
    actorId: string,
    organizationId: string,
  ): Promise<RectificationRecord> {
    await this.getRectificationById(id, organizationId);

    const updated = await this.repository.update(id, {
      status: 'REJECTED',
      rejectedAt: new Date(),
      satRejectionReason: rejectionReason,
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.RECTIFICATION_REJECTED,
      resource: 'customs_rectification',
      resourceId: id,
      metadata: { rejectionReason },
    });

    return updated;
  }
}
