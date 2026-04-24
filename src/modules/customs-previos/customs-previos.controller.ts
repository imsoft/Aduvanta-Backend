import {
  Controller,
  Get,
  Post,
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
import { CustomsPreviosService } from './customs-previos.service.js';
import { CreatePrevioDto } from './dto/create-previo.dto.js';
import { CompletePrevioDto } from './dto/complete-previo.dto.js';
import { ListPreviosDto } from './dto/list-previos.dto.js';

@Controller('customs-previos')
@UseGuards(AuthGuard, PermissionsGuard)
export class CustomsPreviosController {
  constructor(private readonly service: CustomsPreviosService) {}

  @Get()
  @RequirePermission(PERMISSION.CUSTOMS_PREVIOS_READ)
  async list(
    @Query() dto: ListPreviosDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.service.listPrevios(organizationId, limit, offset, {
      entryId: dto.entryId,
      status: dto.status,
      q: dto.q,
    });
  }

  @Get(':id')
  @RequirePermission(PERMISSION.CUSTOMS_PREVIOS_READ)
  async getById(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getPrevioById(id, organizationId);
  }

  @Post()
  @RequirePermission(PERMISSION.CUSTOMS_PREVIOS_CREATE)
  async create(
    @Body() dto: CreatePrevioDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.createPrevio(dto, session.user.id, organizationId);
  }

  @Post(':id/complete')
  @RequirePermission(PERMISSION.CUSTOMS_PREVIOS_UPDATE)
  async complete(
    @Param('id') id: string,
    @Body() dto: CompletePrevioDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.completePrevio(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Post(':id/cancel')
  @RequirePermission(PERMISSION.CUSTOMS_PREVIOS_UPDATE)
  async cancel(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.cancelPrevio(id, session.user.id, organizationId);
  }
}
