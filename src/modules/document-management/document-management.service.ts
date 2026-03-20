import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  DocumentManagementRepository,
  type FolderRecord,
  type TemplateRecord,
  type ChecklistRecord,
  type ChecklistItemRecord,
} from './document-management.repository.js';
import type { CreateFolderDto } from './dto/create-folder.dto.js';
import type { UpdateFolderDto } from './dto/update-folder.dto.js';
import type { CreateTemplateDto } from './dto/create-template.dto.js';
import type { UpdateTemplateDto } from './dto/update-template.dto.js';
import type { CreateChecklistDto } from './dto/create-checklist.dto.js';
import type { AddChecklistItemDto } from './dto/add-checklist-item.dto.js';
import type { UpdateChecklistItemDto } from './dto/update-checklist-item.dto.js';

@Injectable()
export class DocumentManagementService {
  constructor(
    private readonly repository: DocumentManagementRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  // ========== Folders ==========

  async listFolders(
    organizationId: string,
    parentFolderId: string | null,
  ): Promise<FolderRecord[]> {
    return this.repository.findFoldersByOrganization(
      organizationId,
      parentFolderId,
    );
  }

  async getFolderById(
    id: string,
    organizationId: string,
  ): Promise<FolderRecord> {
    const folder = await this.repository.findFolderByIdAndOrg(
      id,
      organizationId,
    );
    if (!folder) {
      throw new NotFoundException(`Folder ${id} not found`);
    }
    return folder;
  }

  async createFolder(
    dto: CreateFolderDto,
    actorId: string,
    organizationId: string,
  ): Promise<FolderRecord> {
    let path = `/${dto.name}`;

    if (dto.parentFolderId) {
      const parent = await this.getFolderById(
        dto.parentFolderId,
        organizationId,
      );
      path = `${parent.path}/${dto.name}`;
    }

    const folder = await this.repository.insertFolder({
      organizationId,
      parentFolderId: dto.parentFolderId,
      name: dto.name,
      path,
      description: dto.description,
      shipmentId: dto.shipmentId,
      entryId: dto.entryId,
      clientId: dto.clientId,
      createdById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.DOC_FOLDER_CREATED,
      resource: 'document_folder',
      resourceId: folder.id,
      metadata: { name: folder.name, path: folder.path },
    });

    return folder;
  }

  async updateFolder(
    id: string,
    dto: UpdateFolderDto,
    actorId: string,
    organizationId: string,
  ): Promise<FolderRecord> {
    await this.getFolderById(id, organizationId);

    const updated = await this.repository.updateFolder(id, { ...dto });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.DOC_FOLDER_UPDATED,
      resource: 'document_folder',
      resourceId: id,
      metadata: { ...dto },
    });

    return updated;
  }

  async deleteFolder(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const folder = await this.getFolderById(id, organizationId);
    await this.repository.deleteFolder(id);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.DOC_FOLDER_DELETED,
      resource: 'document_folder',
      resourceId: id,
      metadata: { name: folder.name, path: folder.path },
    });
  }

  // ========== Templates ==========

  async listTemplates(organizationId: string): Promise<TemplateRecord[]> {
    return this.repository.findTemplatesByOrganization(organizationId);
  }

  async getTemplateById(
    id: string,
    organizationId: string,
  ): Promise<TemplateRecord> {
    const template = await this.repository.findTemplateByIdAndOrg(
      id,
      organizationId,
    );
    if (!template) {
      throw new NotFoundException(`Template ${id} not found`);
    }
    return template;
  }

  async createTemplate(
    dto: CreateTemplateDto,
    actorId: string,
    organizationId: string,
  ): Promise<TemplateRecord> {
    const template = await this.repository.insertTemplate({
      organizationId,
      type: dto.type as 'PEDIMENTO',
      name: dto.name,
      description: dto.description,
      content: dto.content,
      variablesSchema: dto.variablesSchema,
      storageKey: dto.storageKey,
      mimeType: dto.mimeType,
      isDefault: dto.isDefault ?? false,
      createdById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.DOC_TEMPLATE_CREATED,
      resource: 'document_template',
      resourceId: template.id,
      metadata: { type: template.type, name: template.name },
    });

    return template;
  }

  async updateTemplate(
    id: string,
    dto: UpdateTemplateDto,
    actorId: string,
    organizationId: string,
  ): Promise<TemplateRecord> {
    await this.getTemplateById(id, organizationId);

    const updated = await this.repository.updateTemplate(id, { ...dto });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.DOC_TEMPLATE_UPDATED,
      resource: 'document_template',
      resourceId: id,
      metadata: { ...dto },
    });

    return updated;
  }

  async deleteTemplate(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const template = await this.getTemplateById(id, organizationId);
    await this.repository.deleteTemplate(id);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.DOC_TEMPLATE_DELETED,
      resource: 'document_template',
      resourceId: id,
      metadata: { type: template.type, name: template.name },
    });
  }

  // ========== Checklists ==========

  async listChecklists(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ checklists: ChecklistRecord[]; total: number }> {
    return this.repository.findChecklistsByOrganization(
      organizationId,
      limit,
      offset,
    );
  }

  async getChecklistById(
    id: string,
    organizationId: string,
  ): Promise<ChecklistRecord> {
    const checklist = await this.repository.findChecklistByIdAndOrg(
      id,
      organizationId,
    );
    if (!checklist) {
      throw new NotFoundException(`Checklist ${id} not found`);
    }
    return checklist;
  }

  async getChecklistDetails(id: string, organizationId: string) {
    const checklist = await this.getChecklistById(id, organizationId);
    const items = await this.repository.findItemsByChecklist(id);
    return { ...checklist, items };
  }

  async createChecklist(
    dto: CreateChecklistDto,
    actorId: string,
    organizationId: string,
  ): Promise<ChecklistRecord> {
    const checklist = await this.repository.insertChecklist({
      organizationId,
      name: dto.name,
      shipmentId: dto.shipmentId,
      entryId: dto.entryId,
      clientId: dto.clientId,
      observations: dto.observations,
      createdById: actorId,
      status: 'PENDING',
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.DOC_CHECKLIST_CREATED,
      resource: 'document_checklist',
      resourceId: checklist.id,
      metadata: { name: checklist.name },
    });

    return checklist;
  }

  async deleteChecklist(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const checklist = await this.getChecklistById(id, organizationId);
    await this.repository.deleteChecklist(id);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.DOC_CHECKLIST_DELETED,
      resource: 'document_checklist',
      resourceId: id,
      metadata: { name: checklist.name },
    });
  }

  // --- Checklist Items ---

  async listChecklistItems(
    checklistId: string,
    organizationId: string,
  ): Promise<ChecklistItemRecord[]> {
    await this.getChecklistById(checklistId, organizationId);
    return this.repository.findItemsByChecklist(checklistId);
  }

  async addChecklistItem(
    checklistId: string,
    dto: AddChecklistItemDto,
    actorId: string,
    organizationId: string,
  ): Promise<ChecklistItemRecord> {
    await this.getChecklistById(checklistId, organizationId);

    const item = await this.repository.insertChecklistItem({
      checklistId,
      itemNumber: dto.itemNumber,
      documentName: dto.documentName,
      description: dto.description,
      isRequired: dto.isRequired ?? true,
      observations: dto.observations,
      status: 'REQUIRED',
    });

    await this.recalculateChecklistProgress(checklistId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.DOC_CHECKLIST_ITEM_ADDED,
      resource: 'document_checklist_item',
      resourceId: item.id,
      metadata: {
        checklistId,
        documentName: item.documentName,
      },
    });

    return item;
  }

  async updateChecklistItem(
    checklistId: string,
    itemId: string,
    dto: UpdateChecklistItemDto,
    actorId: string,
    organizationId: string,
  ): Promise<ChecklistItemRecord> {
    await this.getChecklistById(checklistId, organizationId);

    const existing = await this.repository.findChecklistItemById(itemId);
    if (!existing || existing.checklistId !== checklistId) {
      throw new NotFoundException(`Item ${itemId} not found in checklist`);
    }

    const updateData: Record<string, unknown> = {};
    if (dto.status) updateData.status = dto.status;
    if (dto.documentId) updateData.documentId = dto.documentId;
    if (dto.rejectionReason) updateData.rejectionReason = dto.rejectionReason;
    if (dto.observations) updateData.observations = dto.observations;

    if (dto.status === 'VERIFIED') {
      updateData.verifiedById = actorId;
      updateData.verifiedAt = new Date();
    }

    const updated = await this.repository.updateChecklistItem(
      itemId,
      updateData as Partial<
        typeof import('../../database/schema/index.js').documentChecklistItems.$inferInsert
      >,
    );

    await this.recalculateChecklistProgress(checklistId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.DOC_CHECKLIST_ITEM_UPDATED,
      resource: 'document_checklist_item',
      resourceId: itemId,
      metadata: { checklistId, ...dto },
    });

    return updated;
  }

  async removeChecklistItem(
    checklistId: string,
    itemId: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    await this.getChecklistById(checklistId, organizationId);

    const existing = await this.repository.findChecklistItemById(itemId);
    if (!existing || existing.checklistId !== checklistId) {
      throw new NotFoundException(`Item ${itemId} not found in checklist`);
    }

    await this.repository.deleteChecklistItem(itemId);
    await this.recalculateChecklistProgress(checklistId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.DOC_CHECKLIST_ITEM_REMOVED,
      resource: 'document_checklist_item',
      resourceId: itemId,
      metadata: {
        checklistId,
        documentName: existing.documentName,
      },
    });
  }

  private async recalculateChecklistProgress(
    checklistId: string,
  ): Promise<void> {
    const items = await this.repository.findItemsByChecklist(checklistId);

    const totalItems = items.length;
    const completedItems = items.filter(
      (i) =>
        i.status === 'RECEIVED' ||
        i.status === 'VERIFIED' ||
        i.status === 'WAIVED' ||
        i.status === 'NOT_APPLICABLE',
    ).length;

    let status: string = 'PENDING';
    if (totalItems > 0 && completedItems === totalItems) {
      status = 'COMPLETE';
    } else if (completedItems > 0) {
      status = 'IN_PROGRESS';
    }

    await this.repository.updateChecklist(checklistId, {
      totalItems,
      completedItems,
      status: status as 'PENDING',
    });
  }
}
