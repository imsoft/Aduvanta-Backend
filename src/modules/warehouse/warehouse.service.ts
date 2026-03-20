import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  WarehouseRepository,
  type WarehouseRecord,
  type ZoneRecord,
  type InventoryRecord,
  type MovementRecord,
} from './warehouse.repository.js';
import type { CreateWarehouseDto } from './dto/create-warehouse.dto.js';
import type { UpdateWarehouseDto } from './dto/update-warehouse.dto.js';
import type { CreateZoneDto } from './dto/create-zone.dto.js';
import type { UpdateZoneDto } from './dto/update-zone.dto.js';
import type { CreateInventoryItemDto } from './dto/create-inventory-item.dto.js';
import type { UpdateInventoryItemDto } from './dto/update-inventory-item.dto.js';
import type { CreateMovementDto } from './dto/create-movement.dto.js';

const MOVEMENT_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['IN_PROCESS', 'CANCELLED'],
  IN_PROCESS: ['COMPLETED', 'CANCELLED'],
};

// ========== Warehouses ==========

@Injectable()
export class WarehouseService {
  constructor(
    private readonly repository: WarehouseRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async listWarehouses(organizationId: string): Promise<WarehouseRecord[]> {
    return this.repository.findWarehousesByOrganization(organizationId);
  }

  async getWarehouseById(
    id: string,
    organizationId: string,
  ): Promise<WarehouseRecord> {
    const warehouse = await this.repository.findWarehouseByIdAndOrg(
      id,
      organizationId,
    );
    if (!warehouse) {
      throw new NotFoundException(`Warehouse ${id} not found`);
    }
    return warehouse;
  }

  async createWarehouse(
    dto: CreateWarehouseDto,
    actorId: string,
    organizationId: string,
  ): Promise<WarehouseRecord> {
    const warehouse = await this.repository.insertWarehouse({
      organizationId,
      type: dto.type as 'BONDED',
      name: dto.name,
      code: dto.code,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      zipCode: dto.zipCode,
      country: dto.country,
      contactName: dto.contactName,
      contactPhone: dto.contactPhone,
      contactEmail: dto.contactEmail,
      satAuthorizationNumber: dto.satAuthorizationNumber,
      bondedWarehouseLicense: dto.bondedWarehouseLicense,
      observations: dto.observations,
      createdById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.WAREHOUSE_CREATED,
      resource: 'warehouse',
      resourceId: warehouse.id,
      metadata: { name: warehouse.name, type: warehouse.type },
    });

    return warehouse;
  }

  async updateWarehouse(
    id: string,
    dto: UpdateWarehouseDto,
    actorId: string,
    organizationId: string,
  ): Promise<WarehouseRecord> {
    await this.getWarehouseById(id, organizationId);

    const updated = await this.repository.updateWarehouse(id, { ...dto });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.WAREHOUSE_UPDATED,
      resource: 'warehouse',
      resourceId: id,
      metadata: { ...dto },
    });

    return updated;
  }

  async deleteWarehouse(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const warehouse = await this.getWarehouseById(id, organizationId);
    await this.repository.deleteWarehouse(id);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.WAREHOUSE_DELETED,
      resource: 'warehouse',
      resourceId: id,
      metadata: { name: warehouse.name },
    });
  }

  // ========== Zones ==========

  async listZones(
    warehouseId: string,
    organizationId: string,
  ): Promise<ZoneRecord[]> {
    await this.getWarehouseById(warehouseId, organizationId);
    return this.repository.findZonesByWarehouse(warehouseId);
  }

  async getZoneById(
    warehouseId: string,
    zoneId: string,
    organizationId: string,
  ): Promise<ZoneRecord> {
    await this.getWarehouseById(warehouseId, organizationId);
    const zone = await this.repository.findZoneById(zoneId);
    if (!zone || zone.warehouseId !== warehouseId) {
      throw new NotFoundException(`Zone ${zoneId} not found in warehouse`);
    }
    return zone;
  }

  async createZone(
    warehouseId: string,
    dto: CreateZoneDto,
    actorId: string,
    organizationId: string,
  ): Promise<ZoneRecord> {
    await this.getWarehouseById(warehouseId, organizationId);

    const zone = await this.repository.insertZone({
      warehouseId,
      type: dto.type as 'STORAGE',
      name: dto.name,
      code: dto.code,
      capacityUnits: dto.capacityUnits,
      capacityUnitType: dto.capacityUnitType,
      observations: dto.observations,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.WAREHOUSE_ZONE_CREATED,
      resource: 'warehouse_zone',
      resourceId: zone.id,
      metadata: { warehouseId, name: zone.name, type: zone.type },
    });

    return zone;
  }

  async updateZone(
    warehouseId: string,
    zoneId: string,
    dto: UpdateZoneDto,
    actorId: string,
    organizationId: string,
  ): Promise<ZoneRecord> {
    await this.getZoneById(warehouseId, zoneId, organizationId);

    const updated = await this.repository.updateZone(zoneId, { ...dto });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.WAREHOUSE_ZONE_UPDATED,
      resource: 'warehouse_zone',
      resourceId: zoneId,
      metadata: { warehouseId, ...dto },
    });

    return updated;
  }

  async deleteZone(
    warehouseId: string,
    zoneId: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const zone = await this.getZoneById(warehouseId, zoneId, organizationId);
    await this.repository.deleteZone(zoneId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.WAREHOUSE_ZONE_DELETED,
      resource: 'warehouse_zone',
      resourceId: zoneId,
      metadata: { warehouseId, name: zone.name },
    });
  }

  // ========== Inventory ==========

  async listInventory(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ items: InventoryRecord[]; total: number }> {
    return this.repository.findInventoryByOrganization(
      organizationId,
      limit,
      offset,
    );
  }

  async searchInventory(
    organizationId: string,
    query: string,
    warehouseId: string | undefined,
    status: string | undefined,
    limit: number,
    offset: number,
  ): Promise<{ items: InventoryRecord[]; total: number }> {
    return this.repository.searchInventory(
      organizationId,
      query,
      warehouseId,
      status,
      limit,
      offset,
    );
  }

  async getInventoryItemById(
    id: string,
    organizationId: string,
  ): Promise<InventoryRecord> {
    const item = await this.repository.findInventoryByIdAndOrg(
      id,
      organizationId,
    );
    if (!item) {
      throw new NotFoundException(`Inventory item ${id} not found`);
    }
    return item;
  }

  async getInventoryByWarehouse(
    warehouseId: string,
    organizationId: string,
  ): Promise<InventoryRecord[]> {
    await this.getWarehouseById(warehouseId, organizationId);
    return this.repository.findInventoryByWarehouse(
      warehouseId,
      organizationId,
    );
  }

  async createInventoryItem(
    dto: CreateInventoryItemDto,
    actorId: string,
    organizationId: string,
  ): Promise<InventoryRecord> {
    await this.getWarehouseById(dto.warehouseId, organizationId);

    const item = await this.repository.insertInventoryItem({
      organizationId,
      warehouseId: dto.warehouseId,
      zoneId: dto.zoneId,
      entryId: dto.entryId,
      shipmentId: dto.shipmentId,
      clientId: dto.clientId,
      sku: dto.sku,
      productDescription: dto.productDescription,
      tariffFraction: dto.tariffFraction,
      lotNumber: dto.lotNumber,
      serialNumber: dto.serialNumber,
      quantity: dto.quantity,
      unitOfMeasure: dto.unitOfMeasure,
      weightKg: dto.weightKg,
      volumeM3: dto.volumeM3,
      declaredValueUsd: dto.declaredValueUsd,
      countryOfOrigin: dto.countryOfOrigin,
      pedimentoNumber: dto.pedimentoNumber,
      entryDate: dto.entryDate ? new Date(dto.entryDate) : undefined,
      expirationDate: dto.expirationDate
        ? new Date(dto.expirationDate)
        : undefined,
      maxStorageDays: dto.maxStorageDays,
      observations: dto.observations,
      createdById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.WAREHOUSE_INVENTORY_CREATED,
      resource: 'warehouse_inventory',
      resourceId: item.id,
      metadata: {
        warehouseId: dto.warehouseId,
        productDescription: item.productDescription,
      },
    });

    return item;
  }

  async updateInventoryItem(
    id: string,
    dto: UpdateInventoryItemDto,
    actorId: string,
    organizationId: string,
  ): Promise<InventoryRecord> {
    await this.getInventoryItemById(id, organizationId);

    const updateData: Record<string, unknown> = {};
    if (dto.zoneId) updateData.zoneId = dto.zoneId;
    if (dto.status) updateData.status = dto.status as 'IN_STOCK';
    if (dto.quantity) updateData.quantity = dto.quantity;
    if (dto.weightKg) updateData.weightKg = dto.weightKg;
    if (dto.volumeM3) updateData.volumeM3 = dto.volumeM3;
    if (dto.pedimentoNumber) updateData.pedimentoNumber = dto.pedimentoNumber;
    if (dto.maxStorageDays) updateData.maxStorageDays = dto.maxStorageDays;
    if (dto.observations) updateData.observations = dto.observations;

    const updated = await this.repository.updateInventoryItem(
      id,
      updateData as Partial<
        typeof import('../../database/schema/index.js').warehouseInventory.$inferInsert
      >,
    );

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.WAREHOUSE_INVENTORY_UPDATED,
      resource: 'warehouse_inventory',
      resourceId: id,
      metadata: { ...dto },
    });

    return updated;
  }

  async deleteInventoryItem(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const item = await this.getInventoryItemById(id, organizationId);
    await this.repository.deleteInventoryItem(id);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.WAREHOUSE_INVENTORY_DELETED,
      resource: 'warehouse_inventory',
      resourceId: id,
      metadata: { productDescription: item.productDescription },
    });
  }

  // ========== Movements ==========

  async listMovements(
    organizationId: string,
    warehouseId: string | undefined,
    limit: number,
    offset: number,
  ): Promise<{ movements: MovementRecord[]; total: number }> {
    return this.repository.findMovementsByOrganization(
      organizationId,
      warehouseId,
      limit,
      offset,
    );
  }

  async getMovementById(
    id: string,
    organizationId: string,
  ): Promise<MovementRecord> {
    const movement = await this.repository.findMovementByIdAndOrg(
      id,
      organizationId,
    );
    if (!movement) {
      throw new NotFoundException(`Movement ${id} not found`);
    }
    return movement;
  }

  async createMovement(
    dto: CreateMovementDto,
    actorId: string,
    organizationId: string,
  ): Promise<MovementRecord> {
    await this.getWarehouseById(dto.warehouseId, organizationId);

    const movement = await this.repository.insertMovement({
      organizationId,
      warehouseId: dto.warehouseId,
      inventoryItemId: dto.inventoryItemId,
      direction: dto.direction as 'INBOUND',
      referenceNumber: dto.referenceNumber,
      entryId: dto.entryId,
      shipmentId: dto.shipmentId,
      clientId: dto.clientId,
      productDescription: dto.productDescription,
      quantity: dto.quantity,
      unitOfMeasure: dto.unitOfMeasure,
      weightKg: dto.weightKg,
      fromZoneId: dto.fromZoneId,
      toZoneId: dto.toZoneId,
      carrierName: dto.carrierName,
      vehiclePlate: dto.vehiclePlate,
      driverName: dto.driverName,
      sealNumber: dto.sealNumber,
      pedimentoNumber: dto.pedimentoNumber,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      observations: dto.observations,
      createdById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.WAREHOUSE_MOVEMENT_CREATED,
      resource: 'warehouse_movement',
      resourceId: movement.id,
      metadata: {
        direction: movement.direction,
        warehouseId: dto.warehouseId,
        productDescription: movement.productDescription,
      },
    });

    return movement;
  }

  async completeMovement(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<MovementRecord> {
    const movement = await this.getMovementById(id, organizationId);

    const allowed = MOVEMENT_STATUS_TRANSITIONS[movement.status];
    if (!allowed || !allowed.includes('COMPLETED')) {
      throw new BadRequestException(
        `Cannot complete movement in status ${movement.status}`,
      );
    }

    const updated = await this.repository.updateMovement(id, {
      status: 'COMPLETED' as 'PENDING',
      completedAt: new Date(),
      completedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.WAREHOUSE_MOVEMENT_COMPLETED,
      resource: 'warehouse_movement',
      resourceId: id,
      metadata: { direction: movement.direction },
    });

    return updated;
  }

  async cancelMovement(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<MovementRecord> {
    const movement = await this.getMovementById(id, organizationId);

    const allowed = MOVEMENT_STATUS_TRANSITIONS[movement.status];
    if (!allowed || !allowed.includes('CANCELLED')) {
      throw new BadRequestException(
        `Cannot cancel movement in status ${movement.status}`,
      );
    }

    const updated = await this.repository.updateMovement(id, {
      status: 'CANCELLED' as 'PENDING',
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.WAREHOUSE_MOVEMENT_CANCELLED,
      resource: 'warehouse_movement',
      resourceId: id,
      metadata: { direction: movement.direction },
    });

    return updated;
  }
}
