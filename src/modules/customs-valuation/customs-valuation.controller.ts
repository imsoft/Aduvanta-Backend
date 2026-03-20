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
import { CustomsValuationService } from './customs-valuation.service.js';
import { CreateValuationDto } from './dto/create-valuation.dto.js';
import { UpdateValuationDto } from './dto/update-valuation.dto.js';
import { ChangeValuationStatusDto } from './dto/change-valuation-status.dto.js';
import { AddValuationItemDto } from './dto/add-valuation-item.dto.js';
import { UpdateValuationItemDto } from './dto/update-valuation-item.dto.js';
import { AddValuationCostDto } from './dto/add-valuation-cost.dto.js';
import { UpdateValuationCostDto } from './dto/update-valuation-cost.dto.js';
import { SearchValuationsDto } from './dto/search-valuations.dto.js';
import { ListValuationsDto } from './dto/list-valuations.dto.js';

@Controller('valuations')
@UseGuards(AuthGuard, PermissionsGuard)
export class CustomsValuationController {
  constructor(private readonly valuationService: CustomsValuationService) {}

  // --- Declarations ---

  @Get()
  @RequirePermission(PERMISSION.VALUATIONS_READ)
  async list(
    @Query() dto: ListValuationsDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.valuationService.listDeclarations(
      organizationId,
      limit,
      offset,
    );
  }

  @Get('search')
  @RequirePermission(PERMISSION.VALUATIONS_SEARCH)
  async search(
    @Query() dto: SearchValuationsDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.valuationService.searchDeclarations(
      organizationId,
      dto.q,
      limit,
      offset,
    );
  }

  @Get(':id')
  @RequirePermission(PERMISSION.VALUATIONS_READ)
  async getById(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.valuationService.getDeclarationById(id, organizationId);
  }

  @Get(':id/details')
  @RequirePermission(PERMISSION.VALUATIONS_READ)
  async getDetails(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.valuationService.getDeclarationDetails(id, organizationId);
  }

  @Post()
  @RequirePermission(PERMISSION.VALUATIONS_CREATE)
  async create(
    @Body() dto: CreateValuationDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.valuationService.createDeclaration(
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Patch(':id')
  @RequirePermission(PERMISSION.VALUATIONS_UPDATE)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateValuationDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.valuationService.updateDeclaration(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete(':id')
  @RequirePermission(PERMISSION.VALUATIONS_DELETE)
  async remove(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.valuationService.deleteDeclaration(
      id,
      session.user.id,
      organizationId,
    );
    return { deleted: true };
  }

  @Post(':id/status')
  @RequirePermission(PERMISSION.VALUATIONS_CHANGE_STATUS)
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeValuationStatusDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.valuationService.changeStatus(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  // --- Items ---

  @Get(':id/items')
  @RequirePermission(PERMISSION.VALUATIONS_READ)
  async listItems(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.valuationService.listItems(id, organizationId);
  }

  @Post(':id/items')
  @RequirePermission(PERMISSION.VALUATIONS_UPDATE)
  async addItem(
    @Param('id') id: string,
    @Body() dto: AddValuationItemDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.valuationService.addItem(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Patch(':id/items/:itemId')
  @RequirePermission(PERMISSION.VALUATIONS_UPDATE)
  async updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateValuationItemDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.valuationService.updateItem(
      id,
      itemId,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete(':id/items/:itemId')
  @RequirePermission(PERMISSION.VALUATIONS_UPDATE)
  async removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.valuationService.removeItem(
      id,
      itemId,
      session.user.id,
      organizationId,
    );
    return { deleted: true };
  }

  // --- Costs ---

  @Get(':id/costs')
  @RequirePermission(PERMISSION.VALUATIONS_READ)
  async listCosts(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.valuationService.listCosts(id, organizationId);
  }

  @Post(':id/costs')
  @RequirePermission(PERMISSION.VALUATIONS_UPDATE)
  async addCost(
    @Param('id') id: string,
    @Body() dto: AddValuationCostDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.valuationService.addCost(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Patch(':id/costs/:costId')
  @RequirePermission(PERMISSION.VALUATIONS_UPDATE)
  async updateCost(
    @Param('id') id: string,
    @Param('costId') costId: string,
    @Body() dto: UpdateValuationCostDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.valuationService.updateCost(
      id,
      costId,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete(':id/costs/:costId')
  @RequirePermission(PERMISSION.VALUATIONS_UPDATE)
  async removeCost(
    @Param('id') id: string,
    @Param('costId') costId: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.valuationService.removeCost(
      id,
      costId,
      session.user.id,
      organizationId,
    );
    return { deleted: true };
  }
}
