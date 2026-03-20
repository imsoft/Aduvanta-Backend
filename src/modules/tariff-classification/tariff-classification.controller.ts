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
import { TariffClassificationService } from './tariff-classification.service.js';
import { SearchFractionsDto } from './dto/search-fractions.dto.js';
import { CreateTariffSectionDto } from './dto/create-tariff-section.dto.js';
import { UpdateTariffSectionDto } from './dto/update-tariff-section.dto.js';
import { CreateTariffChapterDto } from './dto/create-tariff-chapter.dto.js';
import { CreateTariffHeadingDto } from './dto/create-tariff-heading.dto.js';
import { CreateTariffSubheadingDto } from './dto/create-tariff-subheading.dto.js';
import { CreateTariffFractionDto } from './dto/create-tariff-fraction.dto.js';

@Controller('tariff')
@UseGuards(AuthGuard, PermissionsGuard)
export class TariffClassificationController {
  constructor(private readonly tariffService: TariffClassificationService) {}

  // --- Search ---

  @Get('search')
  @RequirePermission(PERMISSION.TARIFF_SEARCH)
  async search(@Query() dto: SearchFractionsDto) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.tariffService.searchFractions(dto.q, limit, offset);
  }

  // --- Sections ---

  @Get('sections')
  @RequirePermission(PERMISSION.TARIFF_READ)
  async listSections() {
    return this.tariffService.listSections();
  }

  @Get('sections/:id')
  @RequirePermission(PERMISSION.TARIFF_READ)
  async getSection(@Param('id') id: string) {
    return this.tariffService.getSectionById(id);
  }

  @Post('sections')
  @RequirePermission(PERMISSION.TARIFF_CREATE)
  async createSection(
    @Body() dto: CreateTariffSectionDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.tariffService.createSection(
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Patch('sections/:id')
  @RequirePermission(PERMISSION.TARIFF_UPDATE)
  async updateSection(
    @Param('id') id: string,
    @Body() dto: UpdateTariffSectionDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.tariffService.updateSection(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete('sections/:id')
  @RequirePermission(PERMISSION.TARIFF_DELETE)
  async deleteSection(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.tariffService.deleteSection(id, session.user.id, organizationId);
    return { deleted: true };
  }

  // --- Chapters ---

  @Get('sections/:sectionId/chapters')
  @RequirePermission(PERMISSION.TARIFF_READ)
  async listChapters(@Param('sectionId') sectionId: string) {
    return this.tariffService.listChaptersBySection(sectionId);
  }

  @Get('chapters/:id')
  @RequirePermission(PERMISSION.TARIFF_READ)
  async getChapter(@Param('id') id: string) {
    return this.tariffService.getChapterById(id);
  }

  @Post('chapters')
  @RequirePermission(PERMISSION.TARIFF_CREATE)
  async createChapter(
    @Body() dto: CreateTariffChapterDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.tariffService.createChapter(
      dto,
      session.user.id,
      organizationId,
    );
  }

  // --- Headings ---

  @Get('chapters/:chapterId/headings')
  @RequirePermission(PERMISSION.TARIFF_READ)
  async listHeadings(@Param('chapterId') chapterId: string) {
    return this.tariffService.listHeadingsByChapter(chapterId);
  }

  @Get('headings/:id')
  @RequirePermission(PERMISSION.TARIFF_READ)
  async getHeading(@Param('id') id: string) {
    return this.tariffService.getHeadingById(id);
  }

  @Post('headings')
  @RequirePermission(PERMISSION.TARIFF_CREATE)
  async createHeading(
    @Body() dto: CreateTariffHeadingDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.tariffService.createHeading(
      dto,
      session.user.id,
      organizationId,
    );
  }

  // --- Subheadings ---

  @Get('headings/:headingId/subheadings')
  @RequirePermission(PERMISSION.TARIFF_READ)
  async listSubheadings(@Param('headingId') headingId: string) {
    return this.tariffService.listSubheadingsByHeading(headingId);
  }

  @Get('subheadings/:id')
  @RequirePermission(PERMISSION.TARIFF_READ)
  async getSubheading(@Param('id') id: string) {
    return this.tariffService.getSubheadingById(id);
  }

  @Post('subheadings')
  @RequirePermission(PERMISSION.TARIFF_CREATE)
  async createSubheading(
    @Body() dto: CreateTariffSubheadingDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.tariffService.createSubheading(
      dto,
      session.user.id,
      organizationId,
    );
  }

  // --- Fractions ---

  @Get('subheadings/:subheadingId/fractions')
  @RequirePermission(PERMISSION.TARIFF_READ)
  async listFractions(@Param('subheadingId') subheadingId: string) {
    return this.tariffService.listFractionsBySubheading(subheadingId);
  }

  @Get('fractions/:id')
  @RequirePermission(PERMISSION.TARIFF_READ)
  async getFraction(@Param('id') id: string) {
    return this.tariffService.getFractionById(id);
  }

  @Get('fractions/:id/details')
  @RequirePermission(PERMISSION.TARIFF_READ)
  async getFractionDetails(@Param('id') id: string) {
    return this.tariffService.getFractionDetails(id);
  }

  @Get('fractions/code/:code')
  @RequirePermission(PERMISSION.TARIFF_READ)
  async getFractionByCode(@Param('code') code: string) {
    return this.tariffService.getFractionByCode(code);
  }

  @Post('fractions')
  @RequirePermission(PERMISSION.TARIFF_CREATE)
  async createFraction(
    @Body() dto: CreateTariffFractionDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.tariffService.createFraction(
      dto,
      session.user.id,
      organizationId,
    );
  }
}
