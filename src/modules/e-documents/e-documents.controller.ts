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
import { EDocumentsService } from './e-documents.service.js';
import { CreateEDocumentDto } from './dto/create-e-document.dto.js';
import { UpdateEDocumentDto } from './dto/update-e-document.dto.js';
import { ChangeEDocumentStatusDto } from './dto/change-e-document-status.dto.js';
import { AddEDocumentItemDto } from './dto/add-e-document-item.dto.js';
import { UpdateEDocumentItemDto } from './dto/update-e-document-item.dto.js';
import { SearchEDocumentsDto } from './dto/search-e-documents.dto.js';
import { ListEDocumentsDto } from './dto/list-e-documents.dto.js';

@Controller('e-documents')
@UseGuards(AuthGuard, PermissionsGuard)
export class EDocumentsController {
  constructor(private readonly eDocumentsService: EDocumentsService) {}

  // --- E-Documents ---

  @Get()
  @RequirePermission(PERMISSION.E_DOCUMENTS_READ)
  async list(
    @Query() dto: ListEDocumentsDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.eDocumentsService.listDocuments(organizationId, limit, offset);
  }

  @Get('search')
  @RequirePermission(PERMISSION.E_DOCUMENTS_SEARCH)
  async search(
    @Query() dto: SearchEDocumentsDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.eDocumentsService.searchDocuments(
      organizationId,
      dto.q,
      limit,
      offset,
    );
  }

  @Get(':id')
  @RequirePermission(PERMISSION.E_DOCUMENTS_READ)
  async getById(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.eDocumentsService.getDocumentById(id, organizationId);
  }

  @Get(':id/details')
  @RequirePermission(PERMISSION.E_DOCUMENTS_READ)
  async getDetails(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.eDocumentsService.getDocumentDetails(id, organizationId);
  }

  @Post()
  @RequirePermission(PERMISSION.E_DOCUMENTS_CREATE)
  async create(
    @Body() dto: CreateEDocumentDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.eDocumentsService.createDocument(
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Patch(':id')
  @RequirePermission(PERMISSION.E_DOCUMENTS_UPDATE)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEDocumentDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.eDocumentsService.updateDocument(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete(':id')
  @RequirePermission(PERMISSION.E_DOCUMENTS_DELETE)
  async remove(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.eDocumentsService.deleteDocument(
      id,
      session.user.id,
      organizationId,
    );
    return { deleted: true };
  }

  @Post(':id/status')
  @RequirePermission(PERMISSION.E_DOCUMENTS_UPDATE)
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeEDocumentStatusDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.eDocumentsService.changeStatus(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Post(':id/transmit')
  @RequirePermission(PERMISSION.E_DOCUMENTS_TRANSMIT)
  async transmit(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.eDocumentsService.transmitDocument(
      id,
      session.user.id,
      organizationId,
    );
  }

  // --- Items ---

  @Get(':id/items')
  @RequirePermission(PERMISSION.E_DOCUMENTS_READ)
  async listItems(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.eDocumentsService.listItems(id, organizationId);
  }

  @Post(':id/items')
  @RequirePermission(PERMISSION.E_DOCUMENTS_UPDATE)
  async addItem(
    @Param('id') id: string,
    @Body() dto: AddEDocumentItemDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.eDocumentsService.addItem(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Patch(':id/items/:itemId')
  @RequirePermission(PERMISSION.E_DOCUMENTS_UPDATE)
  async updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateEDocumentItemDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.eDocumentsService.updateItem(
      id,
      itemId,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete(':id/items/:itemId')
  @RequirePermission(PERMISSION.E_DOCUMENTS_UPDATE)
  async removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.eDocumentsService.removeItem(
      id,
      itemId,
      session.user.id,
      organizationId,
    );
    return { deleted: true };
  }

  // --- Transmissions ---

  @Get(':id/transmissions')
  @RequirePermission(PERMISSION.E_DOCUMENTS_READ)
  async listTransmissions(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.eDocumentsService.listTransmissions(id, organizationId);
  }
}
