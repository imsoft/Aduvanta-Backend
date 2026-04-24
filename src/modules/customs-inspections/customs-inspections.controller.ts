import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { Session } from '../../common/decorators/session.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { CustomsInspectionsService } from './customs-inspections.service.js';
import { CreateInspectionDto } from './dto/create-inspection.dto.js';
import { UpdateInspectionDto } from './dto/update-inspection.dto.js';
import { ListInspectionsDto } from './dto/list-inspections.dto.js';

@Controller('customs-inspections')
@UseGuards(AuthGuard, PermissionsGuard)
export class CustomsInspectionsController {
  constructor(private readonly service: CustomsInspectionsService) {}

  @Get()
  @RequirePermission(PERMISSION.CUSTOMS_INSPECTIONS_READ)
  async list(
    @Query() dto: ListInspectionsDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.service.listInspections(organizationId, limit, offset, {
      entryId: dto.entryId,
      semaphoreColor: dto.semaphoreColor,
      inspectionResult: dto.inspectionResult,
    });
  }

  @Get(':id')
  @RequirePermission(PERMISSION.CUSTOMS_INSPECTIONS_READ)
  async getById(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getInspectionById(id, organizationId);
  }

  @Post()
  @RequirePermission(PERMISSION.CUSTOMS_INSPECTIONS_CREATE)
  async create(
    @Body() dto: CreateInspectionDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.createInspection(dto, session.user.id, organizationId);
  }

  @Patch(':id')
  @RequirePermission(PERMISSION.CUSTOMS_INSPECTIONS_UPDATE)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateInspectionDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.updateInspection(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Post(':id/semaphore')
  @RequirePermission(PERMISSION.CUSTOMS_INSPECTIONS_UPDATE)
  async recordSemaphore(
    @Param('id') id: string,
    @Body() body: { color: 'GREEN' | 'RED' },
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.recordModulationResult(
      id,
      body.color,
      session.user.id,
      organizationId,
    );
  }
}
