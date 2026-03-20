import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import { ClientsService } from '../clients/clients.service.js';
import { MembershipsRepository } from '../memberships/memberships.repository.js';
import type {
  OperationRecord,
  OperationStatusHistoryRecord,
} from './operations.repository.js';
import { OperationsRepository } from './operations.repository.js';
import type { CreateOperationDto } from './dto/create-operation.dto.js';
import type { UpdateOperationDto } from './dto/update-operation.dto.js';
import type { ListOperationsDto } from './dto/list-operations.dto.js';
import type { ChangeOperationStatusDto } from './dto/change-operation-status.dto.js';
import type { AssignOperationDto } from './dto/assign-operation.dto.js';
import type { OperationStatus } from '../../database/schema/index.js';

const CLOSED_STATUSES: OperationStatus[] = ['COMPLETED', 'CANCELLED'];

@Injectable()
export class OperationsService {
  constructor(
    private readonly operationsRepository: OperationsRepository,
    private readonly clientsService: ClientsService,
    private readonly membershipsRepository: MembershipsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(
    organizationId: string,
    dto: CreateOperationDto,
    actorId: string,
  ): Promise<OperationRecord> {
    // Validate client belongs to this organization.
    await this.clientsService.getById(dto.clientId, organizationId);

    if (dto.assignedUserId) {
      await this.validateMembership(dto.assignedUserId, organizationId);
    }

    const now = new Date();

    const operation = await this.operationsRepository.insert({
      organizationId,
      clientId: dto.clientId,
      reference: dto.reference,
      title: dto.title,
      description: dto.description,
      type: dto.type,
      status: 'OPEN',
      priority: dto.priority,
      assignedUserId: dto.assignedUserId ?? null,
      createdById: actorId,
      openedAt: now,
      dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
      closedAt: null,
    });

    // Record the initial status history entry.
    await this.operationsRepository.insertStatusHistory({
      organizationId,
      operationId: operation.id,
      fromStatus: null,
      toStatus: 'OPEN',
      changedById: actorId,
      comment: null,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.OPERATION_CREATED,
      resource: 'operation',
      resourceId: operation.id,
      metadata: {
        reference: operation.reference,
        clientId: operation.clientId,
        type: operation.type,
        priority: operation.priority,
      },
    });

    return operation;
  }

  async list(
    organizationId: string,
    dto: ListOperationsDto,
  ): Promise<OperationRecord[]> {
    return this.operationsRepository.findByOrganization({
      organizationId,
      search: dto.search,
      clientId: dto.clientId,
      status: dto.status,
      priority: dto.priority,
      assignedUserId: dto.assignedUserId,
      limit: dto.limit,
      offset: dto.offset,
    });
  }

  async getById(id: string, organizationId: string): Promise<OperationRecord> {
    const operation = await this.operationsRepository.findById(id);

    if (!operation || operation.organizationId !== organizationId) {
      throw new NotFoundException(`Operation ${id} not found`);
    }

    return operation;
  }

  async update(
    id: string,
    organizationId: string,
    dto: UpdateOperationDto,
    actorId: string,
  ): Promise<OperationRecord> {
    await this.getById(id, organizationId);

    const updated = await this.operationsRepository.update(id, organizationId, {
      ...dto,
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
    });

    if (!updated) {
      throw new NotFoundException(`Operation ${id} not found`);
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.OPERATION_UPDATED,
      resource: 'operation',
      resourceId: id,
      metadata: { changedFields: dto },
    });

    return updated;
  }

  async deactivate(
    id: string,
    organizationId: string,
    actorId: string,
  ): Promise<void> {
    const operation = await this.getById(id, organizationId);

    const previousStatus = operation.status;

    await this.operationsRepository.update(id, organizationId, {
      status: 'CANCELLED',
      closedAt: new Date(),
    });

    await this.operationsRepository.insertStatusHistory({
      organizationId,
      operationId: id,
      fromStatus: previousStatus,
      toStatus: 'CANCELLED',
      changedById: actorId,
      comment: 'Operation deactivated',
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.OPERATION_DELETED,
      resource: 'operation',
      resourceId: id,
      metadata: { reference: operation.reference },
    });
  }

  async changeStatus(
    id: string,
    organizationId: string,
    dto: ChangeOperationStatusDto,
    actorId: string,
  ): Promise<OperationRecord> {
    const operation = await this.getById(id, organizationId);

    if (operation.status === dto.status) {
      throw new BadRequestException(
        `Operation is already in status ${dto.status}`,
      );
    }

    const closedAt = CLOSED_STATUSES.includes(dto.status) ? new Date() : null;

    const updated = await this.operationsRepository.update(id, organizationId, {
      status: dto.status,
      closedAt,
    });

    if (!updated) {
      throw new NotFoundException(`Operation ${id} not found`);
    }

    await this.operationsRepository.insertStatusHistory({
      organizationId,
      operationId: id,
      fromStatus: operation.status,
      toStatus: dto.status,
      changedById: actorId,
      comment: dto.comment ?? null,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.OPERATION_STATUS_CHANGED,
      resource: 'operation',
      resourceId: id,
      metadata: {
        previousStatus: operation.status,
        nextStatus: dto.status,
        reference: operation.reference,
      },
    });

    return updated;
  }

  async assign(
    id: string,
    organizationId: string,
    dto: AssignOperationDto,
    actorId: string,
  ): Promise<OperationRecord> {
    await this.getById(id, organizationId);

    if (dto.assignedUserId) {
      await this.validateMembership(dto.assignedUserId, organizationId);
    }

    const updated = await this.operationsRepository.update(id, organizationId, {
      assignedUserId: dto.assignedUserId,
    });

    if (!updated) {
      throw new NotFoundException(`Operation ${id} not found`);
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.OPERATION_ASSIGNED,
      resource: 'operation',
      resourceId: id,
      metadata: { assignedUserId: dto.assignedUserId },
    });

    return updated;
  }

  async getStatusHistory(
    id: string,
    organizationId: string,
  ): Promise<OperationStatusHistoryRecord[]> {
    await this.getById(id, organizationId);
    return this.operationsRepository.findStatusHistory(id, organizationId);
  }

  private async validateMembership(
    userId: string,
    organizationId: string,
  ): Promise<void> {
    const membership = await this.membershipsRepository.findByUserAndOrg(
      userId,
      organizationId,
    );

    if (!membership) {
      throw new BadRequestException(
        `User ${userId} is not a member of this organization`,
      );
    }
  }
}
