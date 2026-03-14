import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
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
import { ExportsService } from './exports.service.js';
import { CreateExportJobDto } from './dto/create-export-job.dto.js';
import { ListExportJobsDto } from './dto/list-export-jobs.dto.js';

@Controller('exports')
@UseGuards(AuthGuard, PermissionsGuard)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get()
  @RequirePermission(PERMISSION.EXPORTS_READ)
  async list(
    @Headers('x-organization-id') organizationId: string,
    @Query() query: ListExportJobsDto,
  ) {
    return this.exportsService.list(organizationId, query);
  }

  @Post()
  @RequirePermission(PERMISSION.EXPORTS_GENERATE)
  async create(
    @Headers('x-organization-id') organizationId: string,
    @Body() dto: CreateExportJobDto,
    @Session() session: ActiveSession,
  ) {
    return this.exportsService.create(organizationId, dto, session.user.id);
  }

  @Get(':exportJobId')
  @RequirePermission(PERMISSION.EXPORTS_READ)
  async getById(
    @Headers('x-organization-id') organizationId: string,
    @Param('exportJobId') exportJobId: string,
  ) {
    return this.exportsService.getById(exportJobId, organizationId);
  }

  @Get(':exportJobId/download-url')
  @RequirePermission(PERMISSION.EXPORTS_READ)
  async getDownloadUrl(
    @Headers('x-organization-id') organizationId: string,
    @Param('exportJobId') exportJobId: string,
  ) {
    return this.exportsService.getDownloadUrl(exportJobId, organizationId);
  }
}
