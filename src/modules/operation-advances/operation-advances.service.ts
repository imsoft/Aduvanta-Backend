import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import { OperationsService } from '../operations/operations.service.js';
import type { OperationAdvanceRecord } from './operation-advances.repository.js';
import { OperationAdvancesRepository } from './operation-advances.repository.js';
import type { CreateOperationAdvanceDto } from './dto/create-operation-advance.dto.js';
import type { UpdateOperationAdvanceDto } from './dto/update-operation-advance.dto.js';
import type { ListOperationAdvancesDto } from './dto/list-operation-advances.dto.js';

@Injectable()
export class OperationAdvancesService {
  constructor(
    private readonly advancesRepository: OperationAdvancesRepository,
    private readonly operationsService: OperationsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async list(
    operationId: string,
    organizationId: string,
    dto: ListOperationAdvancesDto,
  ): Promise<OperationAdvanceRecord[]> {
    await this.operationsService.getById(operationId, organizationId);

    return this.advancesRepository.findByOperation({
      operationId,
      organizationId,
      status: dto.status,
    });
  }

  async create(
    operationId: string,
    organizationId: string,
    dto: CreateOperationAdvanceDto,
    actorId: string,
  ): Promise<OperationAdvanceRecord> {
    await this.operationsService.getById(operationId, organizationId);

    const advance = await this.advancesRepository.insert({
      organizationId,
      operationId,
      amount: String(dto.amount),
      currency: dto.currency,
      reference: dto.reference ?? null,
      notes: dto.notes ?? null,
      receivedAt: new Date(dto.receivedAt),
      status: 'ACTIVE',
      createdById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.FINANCE_ADVANCE_CREATED,
      resource: 'operation_advance',
      resourceId: advance.id,
      metadata: {
        operationId,
        amount: advance.amount,
        currency: advance.currency,
        reference: advance.reference,
      },
    });

    return advance;
  }

  async getById(
    id: string,
    organizationId: string,
  ): Promise<OperationAdvanceRecord> {
    const advance = await this.advancesRepository.findById(id);

    if (!advance || advance.organizationId !== organizationId) {
      throw new NotFoundException(`Advance ${id} not found`);
    }

    return advance;
  }

  async update(
    id: string,
    organizationId: string,
    dto: UpdateOperationAdvanceDto,
    actorId: string,
  ): Promise<OperationAdvanceRecord> {
    await this.getById(id, organizationId);

    const data: Record<string, unknown> = {};
    if (dto.amount !== undefined) data.amount = String(dto.amount);
    if (dto.currency !== undefined) data.currency = dto.currency;
    if (dto.reference !== undefined) data.reference = dto.reference;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.receivedAt !== undefined)
      data.receivedAt = new Date(dto.receivedAt);
    if (dto.status !== undefined) data.status = dto.status;

    const updated = await this.advancesRepository.update(
      id,
      organizationId,
      data,
    );

    if (!updated) {
      throw new NotFoundException(`Advance ${id} not found`);
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.FINANCE_ADVANCE_UPDATED,
      resource: 'operation_advance',
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
    const advance = await this.getById(id, organizationId);

    await this.advancesRepository.update(id, organizationId, {
      status: 'INACTIVE',
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.FINANCE_ADVANCE_DELETED,
      resource: 'operation_advance',
      resourceId: id,
      metadata: {
        operationId: advance.operationId,
        amount: advance.amount,
        currency: advance.currency,
      },
    });
  }
}
