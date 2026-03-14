import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Session } from '../../common/decorators/session.decorator.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { ImportsService } from './imports.service.js';
import { CreateImportJobDto } from './dto/create-import-job.dto.js';
import { ListImportJobsDto } from './dto/list-import-jobs.dto.js';

@Controller('imports')
@UseGuards(AuthGuard, PermissionsGuard)
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Get()
  @RequirePermission(PERMISSION.IMPORTS_READ)
  async list(
    @Headers('x-organization-id') organizationId: string,
    @Query() query: ListImportJobsDto,
  ) {
    return this.importsService.list(organizationId, query);
  }

  @Post()
  @RequirePermission(PERMISSION.IMPORTS_RUN)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Headers('x-organization-id') organizationId: string,
    @Body() dto: CreateImportJobDto,
    @UploadedFile() file: Express.Multer.File,
    @Session() session: ActiveSession,
  ) {
    if (!file) {
      throw new BadRequestException('A CSV file is required');
    }

    const csvContent = file.buffer.toString('utf-8');
    return this.importsService.create(
      organizationId,
      dto,
      csvContent,
      file.originalname,
      session.user.id,
    );
  }

  @Get(':importJobId')
  @RequirePermission(PERMISSION.IMPORTS_READ)
  async getById(
    @Headers('x-organization-id') organizationId: string,
    @Param('importJobId') importJobId: string,
  ) {
    return this.importsService.getById(importJobId, organizationId);
  }
}
