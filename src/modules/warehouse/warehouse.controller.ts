import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Session } from '../../common/decorators/session.decorator.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { WarehouseService } from './warehouse.service.js';
import { CreateWarehouseDto } from './dto/create-warehouse.dto.js';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto.js';
import { CreateZoneDto } from './dto/create-zone.dto.js';
import { UpdateZoneDto } from './dto/update-zone.dto.js';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto.js';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto.js';
import { CreateMovementDto } from './dto/create-movement.dto.js';
import { ListInventoryDto } from './dto/list-inventory.dto.js';
import { SearchInventoryDto } from './dto/search-inventory.dto.js';

@Controller('warehouse')
@UseGuards(AuthGuard, PermissionsGuard)
export class WarehouseController {
  constructor(private readonly service: WarehouseService) {}

  // ========== Warehouses ==========

  @Get()
  @RequirePermission(PERMISSION.WAREHOUSES_READ)
  async listWarehouses(@Headers('x-organization-id') organizationId: string) {
    return this.service.listWarehouses(organizationId);
  }

  @Get(':id')
  @RequirePermission(PERMISSION.WAREHOUSES_READ)
  async getWarehouseById(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getWarehouseById(id, organizationId);
  }

  @Post()
  @RequirePermission(PERMISSION.WAREHOUSES_CREATE)
  async createWarehouse(
    @Body() dto: CreateWarehouseDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.createWarehouse(dto, session.user.id, organizationId);
  }

  @Patch(':id')
  @RequirePermission(PERMISSION.WAREHOUSES_UPDATE)
  async updateWarehouse(
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.updateWarehouse(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete(':id')
  @RequirePermission(PERMISSION.WAREHOUSES_DELETE)
  async deleteWarehouse(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.service.deleteWarehouse(id, session.user.id, organizationId);
    return { success: true };
  }

  // ========== Zones ==========

  @Get(':warehouseId/zones')
  @RequirePermission(PERMISSION.WAREHOUSES_READ)
  async listZones(
    @Param('warehouseId') warehouseId: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.listZones(warehouseId, organizationId);
  }

  @Get(':warehouseId/zones/:zoneId')
  @RequirePermission(PERMISSION.WAREHOUSES_READ)
  async getZoneById(
    @Param('warehouseId') warehouseId: string,
    @Param('zoneId') zoneId: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getZoneById(warehouseId, zoneId, organizationId);
  }

  @Post(':warehouseId/zones')
  @RequirePermission(PERMISSION.WAREHOUSES_CREATE)
  async createZone(
    @Param('warehouseId') warehouseId: string,
    @Body() dto: CreateZoneDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.createZone(
      warehouseId,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Patch(':warehouseId/zones/:zoneId')
  @RequirePermission(PERMISSION.WAREHOUSES_UPDATE)
  async updateZone(
    @Param('warehouseId') warehouseId: string,
    @Param('zoneId') zoneId: string,
    @Body() dto: UpdateZoneDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.updateZone(
      warehouseId,
      zoneId,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete(':warehouseId/zones/:zoneId')
  @RequirePermission(PERMISSION.WAREHOUSES_DELETE)
  async deleteZone(
    @Param('warehouseId') warehouseId: string,
    @Param('zoneId') zoneId: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.service.deleteZone(
      warehouseId,
      zoneId,
      session.user.id,
      organizationId,
    );
    return { success: true };
  }

  // ========== Inventory ==========

  @Get('inventory/list')
  @RequirePermission(PERMISSION.WAREHOUSE_INVENTORY_READ)
  async listInventory(
    @Query() dto: ListInventoryDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.service.listInventory(organizationId, limit, offset);
  }

  @Get('inventory/search')
  @RequirePermission(PERMISSION.WAREHOUSE_INVENTORY_SEARCH)
  async searchInventory(
    @Query() dto: SearchInventoryDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.service.searchInventory(
      organizationId,
      dto.q,
      dto.warehouseId,
      dto.status,
      limit,
      offset,
    );
  }

  @Get('inventory/:id')
  @RequirePermission(PERMISSION.WAREHOUSE_INVENTORY_READ)
  async getInventoryItemById(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getInventoryItemById(id, organizationId);
  }

  @Get(':warehouseId/inventory')
  @RequirePermission(PERMISSION.WAREHOUSE_INVENTORY_READ)
  async getInventoryByWarehouse(
    @Param('warehouseId') warehouseId: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getInventoryByWarehouse(warehouseId, organizationId);
  }

  @Post('inventory')
  @RequirePermission(PERMISSION.WAREHOUSE_INVENTORY_CREATE)
  async createInventoryItem(
    @Body() dto: CreateInventoryItemDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.createInventoryItem(
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Patch('inventory/:id')
  @RequirePermission(PERMISSION.WAREHOUSE_INVENTORY_UPDATE)
  async updateInventoryItem(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryItemDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.updateInventoryItem(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete('inventory/:id')
  @RequirePermission(PERMISSION.WAREHOUSE_INVENTORY_DELETE)
  async deleteInventoryItem(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.service.deleteInventoryItem(id, session.user.id, organizationId);
    return { success: true };
  }

  // ========== Movements ==========

  @Get('movements/list')
  @RequirePermission(PERMISSION.WAREHOUSE_MOVEMENTS_READ)
  async listMovements(
    @Query() dto: ListInventoryDto,
    @Query('warehouseId') warehouseId: string | undefined,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.service.listMovements(
      organizationId,
      warehouseId,
      limit,
      offset,
    );
  }

  @Get('movements/:id')
  @RequirePermission(PERMISSION.WAREHOUSE_MOVEMENTS_READ)
  async getMovementById(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getMovementById(id, organizationId);
  }

  @Post('movements')
  @RequirePermission(PERMISSION.WAREHOUSE_MOVEMENTS_CREATE)
  async createMovement(
    @Body() dto: CreateMovementDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.createMovement(dto, session.user.id, organizationId);
  }

  @Post('movements/:id/complete')
  @RequirePermission(PERMISSION.WAREHOUSE_MOVEMENTS_COMPLETE)
  async completeMovement(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.completeMovement(id, session.user.id, organizationId);
  }

  @Post('movements/:id/cancel')
  @RequirePermission(PERMISSION.WAREHOUSE_MOVEMENTS_CANCEL)
  async cancelMovement(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.cancelMovement(id, session.user.id, organizationId);
  }
}
