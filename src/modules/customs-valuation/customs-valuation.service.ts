import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  CustomsValuationRepository,
  type ValuationRecord,
  type ValuationItemRecord,
  type ValuationCostRecord,
} from './customs-valuation.repository.js';
import type { CreateValuationDto } from './dto/create-valuation.dto.js';
import type { UpdateValuationDto } from './dto/update-valuation.dto.js';
import type { ChangeValuationStatusDto } from './dto/change-valuation-status.dto.js';
import type { AddValuationItemDto } from './dto/add-valuation-item.dto.js';
import type { UpdateValuationItemDto } from './dto/update-valuation-item.dto.js';
import type { AddValuationCostDto } from './dto/add-valuation-cost.dto.js';
import type { UpdateValuationCostDto } from './dto/update-valuation-cost.dto.js';

const EDITABLE_STATUSES = new Set(['DRAFT', 'REJECTED']);

const STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['COMPLETED'],
  COMPLETED: ['SUBMITTED', 'DRAFT'],
  SUBMITTED: ['APPROVED', 'REJECTED'],
  APPROVED: [],
  REJECTED: ['DRAFT'],
};

@Injectable()
export class CustomsValuationService {
  constructor(
    private readonly repository: CustomsValuationRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  // --- Declarations ---

  async listDeclarations(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ declarations: ValuationRecord[]; total: number }> {
    return this.repository.findDeclarationsByOrganization(
      organizationId,
      limit,
      offset,
    );
  }

  async searchDeclarations(
    organizationId: string,
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ declarations: ValuationRecord[]; total: number }> {
    return this.repository.searchDeclarations(
      organizationId,
      query,
      limit,
      offset,
    );
  }

  async getDeclarationById(
    id: string,
    organizationId: string,
  ): Promise<ValuationRecord> {
    const declaration = await this.repository.findDeclarationByIdAndOrg(
      id,
      organizationId,
    );

    if (!declaration) {
      throw new NotFoundException(`Valuation declaration ${id} not found`);
    }

    return declaration;
  }

  async getDeclarationDetails(id: string, organizationId: string) {
    const declaration = await this.getDeclarationById(id, organizationId);
    const [items, costs] = await Promise.all([
      this.repository.findItemsByDeclaration(id),
      this.repository.findCostsByDeclaration(id),
    ]);

    return { ...declaration, items, costs };
  }

  async createDeclaration(
    dto: CreateValuationDto,
    actorId: string,
    organizationId: string,
  ): Promise<ValuationRecord> {
    const declaration = await this.repository.insertDeclaration({
      organizationId,
      entryId: dto.entryId,
      valuationMethod: dto.valuationMethod as 'TRANSACTION_VALUE',
      declarationNumber: dto.declarationNumber,
      declarationDate: dto.declarationDate,
      customsOfficeName: dto.customsOfficeName,
      supplierName: dto.supplierName,
      supplierTaxId: dto.supplierTaxId,
      supplierAddress: dto.supplierAddress,
      supplierCountry: dto.supplierCountry,
      buyerName: dto.buyerName,
      buyerTaxId: dto.buyerTaxId,
      buyerAddress: dto.buyerAddress,
      invoiceNumber: dto.invoiceNumber,
      invoiceDate: dto.invoiceDate,
      invoiceCurrency: dto.invoiceCurrency,
      exchangeRate: dto.exchangeRate,
      incoterm: dto.incoterm,
      observations: dto.observations,
      createdById: actorId,
      status: 'DRAFT',
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.VALUATION_CREATED,
      resource: 'valuation_declaration',
      resourceId: declaration.id,
      metadata: {
        supplierName: declaration.supplierName,
        buyerName: declaration.buyerName,
        valuationMethod: declaration.valuationMethod,
      },
    });

    return declaration;
  }

  async updateDeclaration(
    id: string,
    dto: UpdateValuationDto,
    actorId: string,
    organizationId: string,
  ): Promise<ValuationRecord> {
    const existing = await this.getDeclarationById(id, organizationId);

    if (!EDITABLE_STATUSES.has(existing.status)) {
      throw new BadRequestException(
        `Cannot edit declaration in status ${existing.status}`,
      );
    }

    const updated = await this.repository.updateDeclaration(id, {
      ...dto,
      valuationMethod: dto.valuationMethod as 'TRANSACTION_VALUE' | undefined,
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.VALUATION_UPDATED,
      resource: 'valuation_declaration',
      resourceId: id,
      metadata: { ...dto },
    });

    return updated;
  }

  async deleteDeclaration(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const declaration = await this.getDeclarationById(id, organizationId);

    if (!EDITABLE_STATUSES.has(declaration.status)) {
      throw new BadRequestException(
        `Cannot delete declaration in status ${declaration.status}`,
      );
    }

    await this.repository.deleteDeclaration(id);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.VALUATION_DELETED,
      resource: 'valuation_declaration',
      resourceId: id,
      metadata: {
        declarationNumber: declaration.declarationNumber,
        supplierName: declaration.supplierName,
      },
    });
  }

  async changeStatus(
    id: string,
    dto: ChangeValuationStatusDto,
    actorId: string,
    organizationId: string,
  ): Promise<ValuationRecord> {
    const declaration = await this.getDeclarationById(id, organizationId);

    const allowedTransitions = STATUS_TRANSITIONS[declaration.status];
    if (!allowedTransitions || !allowedTransitions.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${declaration.status} to ${dto.status}`,
      );
    }

    const updated = await this.repository.updateDeclaration(id, {
      status: dto.status as 'DRAFT',
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.VALUATION_STATUS_CHANGED,
      resource: 'valuation_declaration',
      resourceId: id,
      metadata: {
        previousStatus: declaration.status,
        newStatus: dto.status,
        reason: dto.reason,
      },
    });

    return updated;
  }

  // --- Items ---

  async listItems(
    declarationId: string,
    organizationId: string,
  ): Promise<ValuationItemRecord[]> {
    await this.getDeclarationById(declarationId, organizationId);
    return this.repository.findItemsByDeclaration(declarationId);
  }

  async addItem(
    declarationId: string,
    dto: AddValuationItemDto,
    actorId: string,
    organizationId: string,
  ): Promise<ValuationItemRecord> {
    const declaration = await this.getDeclarationById(
      declarationId,
      organizationId,
    );

    if (!EDITABLE_STATUSES.has(declaration.status)) {
      throw new BadRequestException(
        `Cannot add items to declaration in status ${declaration.status}`,
      );
    }

    const item = await this.repository.insertItem({
      declarationId,
      ...dto,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.VALUATION_ITEM_ADDED,
      resource: 'valuation_item',
      resourceId: item.id,
      metadata: {
        declarationId,
        itemNumber: item.itemNumber,
        description: item.description,
      },
    });

    return item;
  }

  async updateItem(
    declarationId: string,
    itemId: string,
    dto: UpdateValuationItemDto,
    actorId: string,
    organizationId: string,
  ): Promise<ValuationItemRecord> {
    const declaration = await this.getDeclarationById(
      declarationId,
      organizationId,
    );

    if (!EDITABLE_STATUSES.has(declaration.status)) {
      throw new BadRequestException(
        `Cannot update items in declaration in status ${declaration.status}`,
      );
    }

    const existing = await this.repository.findItemById(itemId);
    if (!existing || existing.declarationId !== declarationId) {
      throw new NotFoundException(`Item ${itemId} not found in declaration`);
    }

    const updated = await this.repository.updateItem(itemId, { ...dto });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.VALUATION_ITEM_UPDATED,
      resource: 'valuation_item',
      resourceId: itemId,
      metadata: { declarationId, ...dto },
    });

    return updated;
  }

  async removeItem(
    declarationId: string,
    itemId: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const declaration = await this.getDeclarationById(
      declarationId,
      organizationId,
    );

    if (!EDITABLE_STATUSES.has(declaration.status)) {
      throw new BadRequestException(
        `Cannot remove items from declaration in status ${declaration.status}`,
      );
    }

    const existing = await this.repository.findItemById(itemId);
    if (!existing || existing.declarationId !== declarationId) {
      throw new NotFoundException(`Item ${itemId} not found in declaration`);
    }

    await this.repository.deleteItem(itemId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.VALUATION_ITEM_REMOVED,
      resource: 'valuation_item',
      resourceId: itemId,
      metadata: {
        declarationId,
        itemNumber: existing.itemNumber,
        description: existing.description,
      },
    });
  }

  // --- Costs ---

  async listCosts(
    declarationId: string,
    organizationId: string,
  ): Promise<ValuationCostRecord[]> {
    await this.getDeclarationById(declarationId, organizationId);
    return this.repository.findCostsByDeclaration(declarationId);
  }

  async addCost(
    declarationId: string,
    dto: AddValuationCostDto,
    actorId: string,
    organizationId: string,
  ): Promise<ValuationCostRecord> {
    const declaration = await this.getDeclarationById(
      declarationId,
      organizationId,
    );

    if (!EDITABLE_STATUSES.has(declaration.status)) {
      throw new BadRequestException(
        `Cannot add costs to declaration in status ${declaration.status}`,
      );
    }

    const cost = await this.repository.insertCost({
      declarationId,
      category: dto.category as 'INCREMENTABLE',
      type: dto.type as 'FREIGHT',
      description: dto.description,
      amountCurrency: dto.amountCurrency,
      currency: dto.currency,
      amountMxn: dto.amountMxn,
      prorationMethod: dto.prorationMethod,
      observations: dto.observations,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.VALUATION_COST_ADDED,
      resource: 'valuation_cost',
      resourceId: cost.id,
      metadata: {
        declarationId,
        category: cost.category,
        type: cost.type,
        amountMxn: cost.amountMxn,
      },
    });

    return cost;
  }

  async updateCost(
    declarationId: string,
    costId: string,
    dto: UpdateValuationCostDto,
    actorId: string,
    organizationId: string,
  ): Promise<ValuationCostRecord> {
    const declaration = await this.getDeclarationById(
      declarationId,
      organizationId,
    );

    if (!EDITABLE_STATUSES.has(declaration.status)) {
      throw new BadRequestException(
        `Cannot update costs in declaration in status ${declaration.status}`,
      );
    }

    const existing = await this.repository.findCostById(costId);
    if (!existing || existing.declarationId !== declarationId) {
      throw new NotFoundException(`Cost ${costId} not found in declaration`);
    }

    const updated = await this.repository.updateCost(costId, {
      category: dto.category as 'INCREMENTABLE' | undefined,
      type: dto.type as 'FREIGHT' | undefined,
      description: dto.description,
      amountCurrency: dto.amountCurrency,
      currency: dto.currency,
      amountMxn: dto.amountMxn,
      prorationMethod: dto.prorationMethod,
      observations: dto.observations,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.VALUATION_COST_UPDATED,
      resource: 'valuation_cost',
      resourceId: costId,
      metadata: { declarationId, ...dto },
    });

    return updated;
  }

  async removeCost(
    declarationId: string,
    costId: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const declaration = await this.getDeclarationById(
      declarationId,
      organizationId,
    );

    if (!EDITABLE_STATUSES.has(declaration.status)) {
      throw new BadRequestException(
        `Cannot remove costs from declaration in status ${declaration.status}`,
      );
    }

    const existing = await this.repository.findCostById(costId);
    if (!existing || existing.declarationId !== declarationId) {
      throw new NotFoundException(`Cost ${costId} not found in declaration`);
    }

    await this.repository.deleteCost(costId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.VALUATION_COST_REMOVED,
      resource: 'valuation_cost',
      resourceId: costId,
      metadata: {
        declarationId,
        category: existing.category,
        type: existing.type,
        amountMxn: existing.amountMxn,
      },
    });
  }
}
