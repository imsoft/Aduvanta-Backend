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
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator.js';
import { Idempotent } from '../../common/idempotency/idempotency.decorator.js';
import { RateLimitGuard } from '../../common/rate-limit/rate-limit.guard.js';
import { IdempotencyGuard } from '../../common/idempotency/idempotency.guard.js';
import { AbuseDetectionGuard } from '../../common/abuse-detection/abuse-detection.guard.js';
import { CustomsEntriesService } from './customs-entries.service.js';
import { CreateCustomsEntryDto } from './dto/create-customs-entry.dto.js';
import { UpdateCustomsEntryDto } from './dto/update-customs-entry.dto.js';
import { AddEntryItemDto } from './dto/add-entry-item.dto.js';
import { AddEntryPartyDto } from './dto/add-entry-party.dto.js';
import { AddEntryDocumentDto } from './dto/add-entry-document.dto.js';
import { ChangeEntryStatusDto } from './dto/change-entry-status.dto.js';
import { SearchEntriesDto } from './dto/search-entries.dto.js';
import { ListEntriesDto } from './dto/list-entries.dto.js';

@RateLimit('mutation')
@Controller('customs')
@UseGuards(
  AuthGuard,
  AbuseDetectionGuard,
  RateLimitGuard,
  IdempotencyGuard,
  PermissionsGuard,
)
export class CustomsEntriesController {
  constructor(private readonly customsService: CustomsEntriesService) {}

  // --- Customs Offices (reference data) ---

  @Get('offices')
  @RequirePermission(PERMISSION.CUSTOMS_OFFICES_READ)
  async listOffices() {
    return this.customsService.listOffices();
  }

  @Get('offices/:id')
  @RequirePermission(PERMISSION.CUSTOMS_OFFICES_READ)
  async getOffice(@Param('id') id: string) {
    return this.customsService.getOfficeById(id);
  }

  // --- Customs Patents ---

  @Get('patents')
  @RequirePermission(PERMISSION.CUSTOMS_PATENTS_READ)
  async listPatents(@Headers('x-organization-id') organizationId: string) {
    return this.customsService.listPatents(organizationId);
  }

  @Get('patents/:id')
  @RequirePermission(PERMISSION.CUSTOMS_PATENTS_READ)
  async getPatent(@Param('id') id: string) {
    return this.customsService.getPatentById(id);
  }

  @Post('patents')
  @RequirePermission(PERMISSION.CUSTOMS_PATENTS_CREATE)
  async createPatent(
    @Body() dto: { patentNumber: string; brokerName: string },
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.customsService.createPatent(
      { organizationId, ...dto },
      session.user.id,
    );
  }

  // --- Customs Entries ---

  @Get('entries')
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_READ)
  async listEntries(
    @Query() dto: ListEntriesDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.customsService.listEntries(organizationId, limit, offset);
  }

  @Get('entries/search')
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_SEARCH)
  async searchEntries(
    @Query() dto: SearchEntriesDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.customsService.searchEntries(
      organizationId,
      dto.q,
      limit,
      offset,
    );
  }

  @Get('entries/:id')
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_READ)
  async getEntry(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.customsService.getEntryById(id, organizationId);
  }

  @Get('entries/:id/details')
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_READ)
  async getEntryDetails(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.customsService.getEntryDetails(id, organizationId);
  }

  @Post('entries')
  @Idempotent(10000)
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_CREATE)
  async createEntry(
    @Body() dto: CreateCustomsEntryDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.customsService.createEntry(
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Patch('entries/:id')
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_UPDATE)
  async updateEntry(
    @Param('id') id: string,
    @Body() dto: UpdateCustomsEntryDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.customsService.updateEntry(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete('entries/:id')
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_DELETE)
  async deleteEntry(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.customsService.deleteEntry(id, session.user.id, organizationId);
    return { deleted: true };
  }

  @Post('entries/:id/status')
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_CHANGE_STATUS)
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeEntryStatusDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.customsService.changeStatus(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Get('entries/:id/history')
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_READ)
  async getStatusHistory(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.customsService.getStatusHistory(id, organizationId);
  }

  // --- Entry Items (partidas) ---

  @Get('entries/:entryId/items')
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_READ)
  async listItems(
    @Param('entryId') entryId: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.customsService.listItems(entryId, organizationId);
  }

  @Post('entries/:entryId/items')
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_UPDATE)
  async addItem(
    @Param('entryId') entryId: string,
    @Body() dto: AddEntryItemDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.customsService.addItem(
      entryId,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete('entries/:entryId/items/:itemId')
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_UPDATE)
  async removeItem(
    @Param('entryId') entryId: string,
    @Param('itemId') itemId: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.customsService.removeItem(
      entryId,
      itemId,
      session.user.id,
      organizationId,
    );
    return { deleted: true };
  }

  // --- Entry Parties ---

  @Get('entries/:entryId/parties')
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_READ)
  async listParties(
    @Param('entryId') entryId: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.customsService.listParties(entryId, organizationId);
  }

  @Post('entries/:entryId/parties')
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_UPDATE)
  async addParty(
    @Param('entryId') entryId: string,
    @Body() dto: AddEntryPartyDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.customsService.addParty(
      entryId,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete('entries/:entryId/parties/:partyId')
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_UPDATE)
  async removeParty(
    @Param('entryId') entryId: string,
    @Param('partyId') partyId: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.customsService.removeParty(
      entryId,
      partyId,
      session.user.id,
      organizationId,
    );
    return { deleted: true };
  }

  // --- Entry Documents ---

  @Get('entries/:entryId/documents')
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_READ)
  async listDocuments(
    @Param('entryId') entryId: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.customsService.listDocuments(entryId, organizationId);
  }

  @Post('entries/:entryId/documents')
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_UPDATE)
  async addDocument(
    @Param('entryId') entryId: string,
    @Body() dto: AddEntryDocumentDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.customsService.addDocument(
      entryId,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete('entries/:entryId/documents/:documentId')
  @RequirePermission(PERMISSION.CUSTOMS_ENTRIES_UPDATE)
  async removeDocument(
    @Param('entryId') entryId: string,
    @Param('documentId') documentId: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.customsService.removeDocument(
      entryId,
      documentId,
      session.user.id,
      organizationId,
    );
    return { deleted: true };
  }
}
