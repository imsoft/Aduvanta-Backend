import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import { OperationsService } from '../operations/operations.service.js';
import type { OperationChargeRecord } from './operation-charges.repository.js';
import { OperationChargesRepository } from './operation-charges.repository.js';
import type { CreateOperationChargeDto } from './dto/create-operation-charge.dto.js';
import type { UpdateOperationChargeDto } from './dto/update-operation-charge.dto.js';
import type { ListOperationChargesDto } from './dto/list-operation-charges.dto.js';

@Injectable()
export class OperationChargesService {
  constructor(
    private readonly chargesRepository: OperationChargesRepository,
    private readonly operationsService: OperationsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async list(
    operationId: string,
    organizationId: string,
    dto: ListOperationChargesDto,
  ): Promise<OperationChargeRecord[]> {
    await this.operationsService.getById(operationId, organizationId);

    return this.chargesRepository.findByOperation({
      operationId,
      organizationId,
      status: dto.status,
    });
  }

  async create(
    operationId: string,
    organizationId: string,
    dto: CreateOperationChargeDto,
    actorId: string,
  ): Promise<OperationChargeRecord> {
    await this.operationsService.getById(operationId, organizationId);

    const charge = await this.chargesRepository.insert({
      organizationId,
      operationId,
      type: dto.type,
      description: dto.description ?? null,
      amount: String(dto.amount),
      currency: dto.currency,
      status: 'ACTIVE',
      createdById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.FINANCE_CHARGE_CREATED,
      resource: 'operation_charge',
      resourceId: charge.id,
      metadata: {
        operationId,
        type: charge.type,
        amount: charge.amount,
        currency: charge.currency,
      },
    });

    return charge;
  }

  async getById(id: string, organizationId: string): Promise<OperationChargeRecord> {
    const charge = await this.chargesRepository.findById(id);

    if (!charge || charge.organizationId !== organizationId) {
      throw new NotFoundException(`Charge ${id} not found`);
    }

    return charge;
  }

  async update(
    id: string,
    organizationId: string,
    dto: UpdateOperationChargeDto,
    actorId: string,
  ): Promise<OperationChargeRecord> {
    await this.getById(id, organizationId);

    const data: Record<string, unknown> = {};
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.amount !== undefined) data.amount = String(dto.amount);
    if (dto.currency !== undefined) data.currency = dto.currency;
    if (dto.status !== undefined) data.status = dto.status;

    const updated = await this.chargesRepository.update(id, organizationId, data);

    if (!updated) {
      throw new NotFoundException(`Charge ${id} not found`);
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.FINANCE_CHARGE_UPDATED,
      resource: 'operation_charge',
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
    const charge = await this.getById(id, organizationId);

    await this.chargesRepository.update(id, organizationId, { status: 'INACTIVE' });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.FINANCE_CHARGE_DELETED,
      resource: 'operation_charge',
      resourceId: id,
      metadata: {
        operationId: charge.operationId,
        amount: charge.amount,
        currency: charge.currency,
      },
    });
  }
}
