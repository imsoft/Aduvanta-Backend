import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import type { DocumentCategoryRecord } from './document-categories.repository.js';
import { DocumentCategoriesRepository } from './document-categories.repository.js';
import type { CreateDocumentCategoryDto } from './dto/create-document-category.dto.js';
import type { UpdateDocumentCategoryDto } from './dto/update-document-category.dto.js';

@Injectable()
export class DocumentCategoriesService {
  constructor(
    private readonly categoriesRepository: DocumentCategoriesRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async list(organizationId: string): Promise<DocumentCategoryRecord[]> {
    return this.categoriesRepository.findByOrganization(organizationId);
  }

  async create(
    organizationId: string,
    dto: CreateDocumentCategoryDto,
    actorId: string,
  ): Promise<DocumentCategoryRecord> {
    const existing = await this.categoriesRepository.findByCodeAndOrg(
      dto.code,
      organizationId,
    );

    if (existing) {
      throw new ConflictException(
        `A category with code ${dto.code} already exists in this organization`,
      );
    }

    const category = await this.categoriesRepository.insert({
      ...dto,
      organizationId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.DOCUMENT_CATEGORY_CREATED,
      resource: 'document_category',
      resourceId: category.id,
      metadata: { name: category.name, code: category.code },
    });

    return category;
  }

  async getById(
    id: string,
    organizationId: string,
  ): Promise<DocumentCategoryRecord> {
    const category = await this.categoriesRepository.findById(id);

    if (!category || category.organizationId !== organizationId) {
      throw new NotFoundException(`Document category ${id} not found`);
    }

    return category;
  }

  async update(
    id: string,
    organizationId: string,
    dto: UpdateDocumentCategoryDto,
    actorId: string,
  ): Promise<DocumentCategoryRecord> {
    await this.getById(id, organizationId);

    const updated = await this.categoriesRepository.update(
      id,
      organizationId,
      dto,
    );

    if (!updated) {
      throw new NotFoundException(`Document category ${id} not found`);
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.DOCUMENT_CATEGORY_UPDATED,
      resource: 'document_category',
      resourceId: id,
      metadata: { changedFields: dto },
    });

    return updated;
  }

  async remove(
    id: string,
    organizationId: string,
    actorId: string,
  ): Promise<void> {
    await this.getById(id, organizationId);

    const hasDocuments =
      await this.categoriesRepository.hasDocumentsWithCategory(
        id,
        organizationId,
      );

    if (hasDocuments) {
      throw new BadRequestException(
        'Cannot delete a category that is referenced by existing documents',
      );
    }

    await this.categoriesRepository.delete(id, organizationId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.DOCUMENT_CATEGORY_DELETED,
      resource: 'document_category',
      resourceId: id,
      metadata: {},
    });
  }
}
