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
import { DocumentManagementService } from './document-management.service.js';
import { CreateFolderDto } from './dto/create-folder.dto.js';
import { UpdateFolderDto } from './dto/update-folder.dto.js';
import { CreateTemplateDto } from './dto/create-template.dto.js';
import { UpdateTemplateDto } from './dto/update-template.dto.js';
import { CreateChecklistDto } from './dto/create-checklist.dto.js';
import { AddChecklistItemDto } from './dto/add-checklist-item.dto.js';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto.js';
import { ListFoldersDto } from './dto/list-folders.dto.js';

@Controller('document-management')
@UseGuards(AuthGuard, PermissionsGuard)
export class DocumentManagementController {
  constructor(private readonly service: DocumentManagementService) {}

  // ========== Folders ==========

  @Get('folders')
  @RequirePermission(PERMISSION.DOC_FOLDERS_READ)
  async listFolders(
    @Query('parentFolderId') parentFolderId: string | undefined,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.listFolders(organizationId, parentFolderId ?? null);
  }

  @Get('folders/:id')
  @RequirePermission(PERMISSION.DOC_FOLDERS_READ)
  async getFolderById(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getFolderById(id, organizationId);
  }

  @Post('folders')
  @RequirePermission(PERMISSION.DOC_FOLDERS_CREATE)
  async createFolder(
    @Body() dto: CreateFolderDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.createFolder(dto, session.user.id, organizationId);
  }

  @Patch('folders/:id')
  @RequirePermission(PERMISSION.DOC_FOLDERS_UPDATE)
  async updateFolder(
    @Param('id') id: string,
    @Body() dto: UpdateFolderDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.updateFolder(id, dto, session.user.id, organizationId);
  }

  @Delete('folders/:id')
  @RequirePermission(PERMISSION.DOC_FOLDERS_DELETE)
  async deleteFolder(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.service.deleteFolder(id, session.user.id, organizationId);
    return { success: true };
  }

  // ========== Templates ==========

  @Get('templates')
  @RequirePermission(PERMISSION.DOC_TEMPLATES_READ)
  async listTemplates(@Headers('x-organization-id') organizationId: string) {
    return this.service.listTemplates(organizationId);
  }

  @Get('templates/:id')
  @RequirePermission(PERMISSION.DOC_TEMPLATES_READ)
  async getTemplateById(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getTemplateById(id, organizationId);
  }

  @Post('templates')
  @RequirePermission(PERMISSION.DOC_TEMPLATES_CREATE)
  async createTemplate(
    @Body() dto: CreateTemplateDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.createTemplate(dto, session.user.id, organizationId);
  }

  @Patch('templates/:id')
  @RequirePermission(PERMISSION.DOC_TEMPLATES_UPDATE)
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.updateTemplate(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete('templates/:id')
  @RequirePermission(PERMISSION.DOC_TEMPLATES_DELETE)
  async deleteTemplate(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.service.deleteTemplate(id, session.user.id, organizationId);
    return { success: true };
  }

  // ========== Checklists ==========

  @Get('checklists')
  @RequirePermission(PERMISSION.DOC_CHECKLISTS_READ)
  async listChecklists(
    @Query() dto: ListFoldersDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.service.listChecklists(organizationId, limit, offset);
  }

  @Get('checklists/:id')
  @RequirePermission(PERMISSION.DOC_CHECKLISTS_READ)
  async getChecklistById(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getChecklistDetails(id, organizationId);
  }

  @Post('checklists')
  @RequirePermission(PERMISSION.DOC_CHECKLISTS_CREATE)
  async createChecklist(
    @Body() dto: CreateChecklistDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.createChecklist(dto, session.user.id, organizationId);
  }

  @Delete('checklists/:id')
  @RequirePermission(PERMISSION.DOC_CHECKLISTS_DELETE)
  async deleteChecklist(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.service.deleteChecklist(id, session.user.id, organizationId);
    return { success: true };
  }

  // ========== Checklist Items ==========

  @Get('checklists/:checklistId/items')
  @RequirePermission(PERMISSION.DOC_CHECKLISTS_READ)
  async listChecklistItems(
    @Param('checklistId') checklistId: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.listChecklistItems(checklistId, organizationId);
  }

  @Post('checklists/:checklistId/items')
  @RequirePermission(PERMISSION.DOC_CHECKLISTS_UPDATE)
  async addChecklistItem(
    @Param('checklistId') checklistId: string,
    @Body() dto: AddChecklistItemDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.addChecklistItem(
      checklistId,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Patch('checklists/:checklistId/items/:itemId')
  @RequirePermission(PERMISSION.DOC_CHECKLISTS_UPDATE)
  async updateChecklistItem(
    @Param('checklistId') checklistId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateChecklistItemDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.updateChecklistItem(
      checklistId,
      itemId,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete('checklists/:checklistId/items/:itemId')
  @RequirePermission(PERMISSION.DOC_CHECKLISTS_UPDATE)
  async removeChecklistItem(
    @Param('checklistId') checklistId: string,
    @Param('itemId') itemId: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.service.removeChecklistItem(
      checklistId,
      itemId,
      session.user.id,
      organizationId,
    );
    return { success: true };
  }
}
