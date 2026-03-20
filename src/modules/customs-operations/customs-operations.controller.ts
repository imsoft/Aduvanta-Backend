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
import { CustomsOperationsService } from './customs-operations.service.js';
import { CreateShipmentDto } from './dto/create-shipment.dto.js';
import { UpdateShipmentDto } from './dto/update-shipment.dto.js';
import { ChangeShipmentStatusDto } from './dto/change-shipment-status.dto.js';
import { AddShipmentStageDto } from './dto/add-shipment-stage.dto.js';
import { AddShipmentCommentDto } from './dto/add-shipment-comment.dto.js';
import { LinkEntryDto } from './dto/link-entry.dto.js';
import { SearchShipmentsDto } from './dto/search-shipments.dto.js';
import { ListShipmentsDto } from './dto/list-shipments.dto.js';

@Controller('shipments')
@UseGuards(AuthGuard, PermissionsGuard)
export class CustomsOperationsController {
  constructor(private readonly shipmentsService: CustomsOperationsService) {}

  // --- Shipments ---

  @Get()
  @RequirePermission(PERMISSION.SHIPMENTS_READ)
  async list(
    @Query() dto: ListShipmentsDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.shipmentsService.listShipments(organizationId, limit, offset);
  }

  @Get('search')
  @RequirePermission(PERMISSION.SHIPMENTS_SEARCH)
  async search(
    @Query() dto: SearchShipmentsDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.shipmentsService.searchShipments(
      organizationId,
      dto.q,
      limit,
      offset,
    );
  }

  @Get(':id')
  @RequirePermission(PERMISSION.SHIPMENTS_READ)
  async getById(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.shipmentsService.getShipmentById(id, organizationId);
  }

  @Get(':id/details')
  @RequirePermission(PERMISSION.SHIPMENTS_READ)
  async getDetails(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.shipmentsService.getShipmentDetails(id, organizationId);
  }

  @Post()
  @RequirePermission(PERMISSION.SHIPMENTS_CREATE)
  async create(
    @Body() dto: CreateShipmentDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.shipmentsService.createShipment(
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Patch(':id')
  @RequirePermission(PERMISSION.SHIPMENTS_UPDATE)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateShipmentDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.shipmentsService.updateShipment(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete(':id')
  @RequirePermission(PERMISSION.SHIPMENTS_DELETE)
  async remove(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.shipmentsService.deleteShipment(
      id,
      session.user.id,
      organizationId,
    );
    return { deleted: true };
  }

  @Post(':id/status')
  @RequirePermission(PERMISSION.SHIPMENTS_CHANGE_STATUS)
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeShipmentStatusDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.shipmentsService.changeStatus(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  // --- Stages ---

  @Get(':id/stages')
  @RequirePermission(PERMISSION.SHIPMENTS_READ)
  async listStages(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.shipmentsService.listStages(id, organizationId);
  }

  @Post(':id/stages')
  @RequirePermission(PERMISSION.SHIPMENTS_ADD_STAGE)
  async addStage(
    @Param('id') id: string,
    @Body() dto: AddShipmentStageDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.shipmentsService.addStage(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Post(':id/stages/:stageId/complete')
  @RequirePermission(PERMISSION.SHIPMENTS_ADD_STAGE)
  async completeStage(
    @Param('id') id: string,
    @Param('stageId') stageId: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.shipmentsService.completeStage(
      id,
      stageId,
      session.user.id,
      organizationId,
    );
  }

  // --- Entry Links ---

  @Get(':id/entries')
  @RequirePermission(PERMISSION.SHIPMENTS_READ)
  async listEntries(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.shipmentsService.listLinkedEntries(id, organizationId);
  }

  @Post(':id/entries')
  @RequirePermission(PERMISSION.SHIPMENTS_LINK_ENTRY)
  async linkEntry(
    @Param('id') id: string,
    @Body() dto: LinkEntryDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.shipmentsService.linkEntry(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete(':id/entries/:linkId')
  @RequirePermission(PERMISSION.SHIPMENTS_LINK_ENTRY)
  async unlinkEntry(
    @Param('id') id: string,
    @Param('linkId') linkId: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.shipmentsService.unlinkEntry(
      id,
      linkId,
      session.user.id,
      organizationId,
    );
    return { deleted: true };
  }

  // --- Comments ---

  @Get(':id/comments')
  @RequirePermission(PERMISSION.SHIPMENTS_READ)
  async listComments(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.shipmentsService.listComments(id, organizationId);
  }

  @Post(':id/comments')
  @RequirePermission(PERMISSION.SHIPMENTS_COMMENT)
  async addComment(
    @Param('id') id: string,
    @Body() dto: AddShipmentCommentDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.shipmentsService.addComment(
      id,
      dto,
      session.user.id,
      session.user.name,
      organizationId,
    );
  }
}
