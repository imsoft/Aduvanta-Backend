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
import { ImporterRegistryService } from './importer-registry.service.js';
import { CreateImporterRegistryDto } from './dto/create-registry.dto.js';
import { UpdateImporterRegistryDto } from './dto/update-registry.dto.js';
import { ListImporterRegistryDto } from './dto/list-registry.dto.js';
import { IsString, IsOptional, IsDateString } from 'class-validator';

class AddSectorDto {
  @IsString()
  sectorCode: string;

  @IsString()
  sectorName: string;

  @IsOptional()
  @IsDateString()
  inscriptionDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;
}

@Controller('importer-registry')
@UseGuards(AuthGuard, PermissionsGuard)
export class ImporterRegistryController {
  constructor(private readonly service: ImporterRegistryService) {}

  @Get()
  @RequirePermission(PERMISSION.IMPORTER_REGISTRY_READ)
  async list(
    @Query() dto: ListImporterRegistryDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.service.listImporters(organizationId, limit, offset, {
      q: dto.q,
      status: dto.status,
      clientId: dto.clientId,
    });
  }

  @Get('expiring')
  @RequirePermission(PERMISSION.IMPORTER_REGISTRY_READ)
  async getExpiring(
    @Query('days') days: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const withinDays = days ? parseInt(days, 10) : 60;
    return this.service.getExpiringImporters(organizationId, withinDays);
  }

  @Get(':id')
  @RequirePermission(PERMISSION.IMPORTER_REGISTRY_READ)
  async getById(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getImporterById(id, organizationId);
  }

  @Post()
  @RequirePermission(PERMISSION.IMPORTER_REGISTRY_CREATE)
  async create(
    @Body() dto: CreateImporterRegistryDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.createImporterRegistry(
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Patch(':id')
  @RequirePermission(PERMISSION.IMPORTER_REGISTRY_UPDATE)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateImporterRegistryDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.updateImporterRegistry(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Post(':id/sectors')
  @RequirePermission(PERMISSION.IMPORTER_REGISTRY_UPDATE)
  async addSector(
    @Param('id') id: string,
    @Body() dto: AddSectorDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.addSector(
      id,
      dto.sectorCode,
      dto.sectorName,
      dto.inscriptionDate,
      dto.expirationDate,
      session.user.id,
      organizationId,
    );
  }

  @Delete(':id/sectors/:sectorId')
  @RequirePermission(PERMISSION.IMPORTER_REGISTRY_UPDATE)
  async removeSector(
    @Param('id') id: string,
    @Param('sectorId') sectorId: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.service.removeSector(id, sectorId, session.user.id, organizationId);
    return { deleted: true };
  }
}
