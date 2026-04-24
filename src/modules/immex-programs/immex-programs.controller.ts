import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { ImmexProgramsService } from './immex-programs.service.js';
import { CreateImmexProgramDto } from './dto/create-immex-program.dto.js';
import { ListImmexProgramsDto } from './dto/list-immex-programs.dto.js';

@Controller('immex-programs')
@UseGuards(AuthGuard, PermissionsGuard)
export class ImmexProgramsController {
  constructor(private readonly service: ImmexProgramsService) {}

  @Get()
  @RequirePermission(PERMISSION.IMMEX_PROGRAMS_READ)
  async list(
    @Query() dto: ListImmexProgramsDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.service.listPrograms(organizationId, limit, offset, {
      q: dto.q,
      status: dto.status,
      clientId: dto.clientId,
    });
  }

  @Get('expiring')
  @RequirePermission(PERMISSION.IMMEX_PROGRAMS_READ)
  async getExpiring(
    @Query('days') days: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const withinDays = days ? parseInt(days, 10) : 90;
    return this.service.getExpiringPrograms(organizationId, withinDays);
  }

  @Get(':id')
  @RequirePermission(PERMISSION.IMMEX_PROGRAMS_READ)
  async getById(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getProgramById(id, organizationId);
  }

  @Post()
  @RequirePermission(PERMISSION.IMMEX_PROGRAMS_CREATE)
  async create(
    @Body() dto: CreateImmexProgramDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.createProgram(dto, session.user.id, organizationId);
  }

  @Patch(':id')
  @RequirePermission(PERMISSION.IMMEX_PROGRAMS_UPDATE)
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateImmexProgramDto>,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.updateProgram(id, dto, session.user.id, organizationId);
  }

  @Post(':id/products')
  @RequirePermission(PERMISSION.IMMEX_PROGRAMS_UPDATE)
  async addProduct(
    @Param('id') id: string,
    @Body()
    data: {
      tariffFraction: string;
      description: string;
      unitOfMeasure?: string;
      authorizedQuantity?: string;
      authorizedValueUsd?: string;
    },
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.addAuthorizedProduct(
      id,
      data,
      session.user.id,
      organizationId,
    );
  }

  @Delete(':id/products/:productId')
  @RequirePermission(PERMISSION.IMMEX_PROGRAMS_UPDATE)
  async removeProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.service.removeAuthorizedProduct(
      id,
      productId,
      session.user.id,
      organizationId,
    );
    return { deleted: true };
  }

  @Post(':id/machinery')
  @RequirePermission(PERMISSION.IMMEX_PROGRAMS_UPDATE)
  async addMachinery(
    @Param('id') id: string,
    @Body()
    data: {
      tariffFraction: string;
      description: string;
      brand?: string;
      model?: string;
      serialNumber?: string;
      quantity?: number;
      entryNumber?: string;
      importDate?: string;
      returnDeadline?: string;
    },
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.addMachinery(id, data, session.user.id, organizationId);
  }
}
