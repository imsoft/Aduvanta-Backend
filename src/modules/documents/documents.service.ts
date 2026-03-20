import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import { DocumentCategoriesRepository } from '../document-categories/document-categories.repository.js';
import { OperationsService } from '../operations/operations.service.js';
import { StorageService } from '../storage/storage.service.js';
import type {
  DocumentRecord,
  DocumentVersionRecord,
} from './documents.repository.js';
import { DocumentsRepository } from './documents.repository.js';
import type { CreateDocumentDto } from './dto/create-document.dto.js';
import type { UpdateDocumentDto } from './dto/update-document.dto.js';
import type { ListOperationDocumentsDto } from './dto/list-operation-documents.dto.js';

const SIGNED_URL_EXPIRES_IN = 3600; // 1 hour

export interface UploadedFileInfo {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class DocumentsService {
  constructor(
    private readonly documentsRepository: DocumentsRepository,
    private readonly categoriesRepository: DocumentCategoriesRepository,
    private readonly operationsService: OperationsService,
    private readonly storageService: StorageService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async listForOperation(
    operationId: string,
    organizationId: string,
    dto: ListOperationDocumentsDto,
  ): Promise<DocumentRecord[]> {
    await this.operationsService.getById(operationId, organizationId);

    return this.documentsRepository.findByOperation({
      operationId,
      organizationId,
      search: dto.search,
      categoryId: dto.categoryId,
      status: dto.status,
      limit: dto.limit,
      offset: dto.offset,
    });
  }

  async create(
    operationId: string,
    organizationId: string,
    dto: CreateDocumentDto,
    file: UploadedFileInfo,
    actorId: string,
  ): Promise<DocumentRecord> {
    await this.operationsService.getById(operationId, organizationId);

    if (dto.categoryId) {
      await this.validateCategory(dto.categoryId, organizationId);
    }

    const documentId = crypto.randomUUID();
    const storageKey = buildStorageKey(
      organizationId,
      documentId,
      1,
      file.originalname,
    );

    await this.storageService.upload(storageKey, file.buffer, file.mimetype);

    const document = await this.documentsRepository.insert({
      id: documentId,
      organizationId,
      operationId,
      categoryId: dto.categoryId ?? null,
      name: dto.name ?? file.originalname,
      description: dto.description ?? null,
      storageKey,
      mimeType: file.mimetype,
      sizeInBytes: file.size,
      uploadedById: actorId,
      status: 'ACTIVE',
      currentVersionNumber: 1,
    });

    await this.documentsRepository.insertVersion({
      organizationId,
      documentId,
      versionNumber: 1,
      storageKey,
      mimeType: file.mimetype,
      sizeInBytes: file.size,
      uploadedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.DOCUMENT_CREATED,
      resource: 'document',
      resourceId: documentId,
      metadata: {
        operationId,
        name: document.name,
        mimeType: file.mimetype,
        sizeInBytes: file.size,
      },
    });

    return document;
  }

  async getById(id: string, organizationId: string): Promise<DocumentRecord> {
    const document = await this.documentsRepository.findById(id);

    if (!document || document.organizationId !== organizationId) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    return document;
  }

  async update(
    id: string,
    organizationId: string,
    dto: UpdateDocumentDto,
    actorId: string,
  ): Promise<DocumentRecord> {
    await this.getById(id, organizationId);

    if (dto.categoryId) {
      await this.validateCategory(dto.categoryId, organizationId);
    }

    const updated = await this.documentsRepository.update(
      id,
      organizationId,
      dto,
    );

    if (!updated) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.DOCUMENT_UPDATED,
      resource: 'document',
      resourceId: id,
      metadata: { changedFields: dto },
    });

    return updated;
  }

  async deactivate(
    id: string,
    organizationId: string,
    actorId: string,
  ): Promise<void> {
    await this.getById(id, organizationId);

    await this.documentsRepository.update(id, organizationId, {
      status: 'INACTIVE',
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.DOCUMENT_DELETED,
      resource: 'document',
      resourceId: id,
      metadata: {},
    });
  }

  async uploadVersion(
    id: string,
    organizationId: string,
    file: UploadedFileInfo,
    actorId: string,
  ): Promise<DocumentRecord> {
    const document = await this.getById(id, organizationId);

    const nextVersion = document.currentVersionNumber + 1;
    const storageKey = buildStorageKey(
      organizationId,
      id,
      nextVersion,
      file.originalname,
    );

    await this.storageService.upload(storageKey, file.buffer, file.mimetype);

    await this.documentsRepository.insertVersion({
      organizationId,
      documentId: id,
      versionNumber: nextVersion,
      storageKey,
      mimeType: file.mimetype,
      sizeInBytes: file.size,
      uploadedById: actorId,
    });

    const updated = await this.documentsRepository.update(id, organizationId, {
      storageKey,
      mimeType: file.mimetype,
      sizeInBytes: file.size,
      currentVersionNumber: nextVersion,
    });

    if (!updated) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.DOCUMENT_VERSION_UPLOADED,
      resource: 'document',
      resourceId: id,
      metadata: {
        versionNumber: nextVersion,
        mimeType: file.mimetype,
        sizeInBytes: file.size,
      },
    });

    return updated;
  }

  async getDownloadUrl(
    id: string,
    organizationId: string,
    actorId: string,
  ): Promise<{ url: string; expiresInSeconds: number }> {
    const document = await this.getById(id, organizationId);

    if (document.status === 'INACTIVE') {
      throw new BadRequestException('Cannot download an inactive document');
    }

    const url = await this.storageService.getPresignedUrl(
      document.storageKey,
      SIGNED_URL_EXPIRES_IN,
    );

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.DOCUMENT_DOWNLOADED,
      resource: 'document',
      resourceId: id,
      metadata: { storageKey: document.storageKey },
    });

    return { url, expiresInSeconds: SIGNED_URL_EXPIRES_IN };
  }

  async getVersions(
    id: string,
    organizationId: string,
  ): Promise<DocumentVersionRecord[]> {
    await this.getById(id, organizationId);
    return this.documentsRepository.findVersionsByDocument(id, organizationId);
  }

  private async validateCategory(
    categoryId: string,
    organizationId: string,
  ): Promise<void> {
    const category = await this.categoriesRepository.findById(categoryId);

    if (!category || category.organizationId !== organizationId) {
      throw new BadRequestException(
        `Document category ${categoryId} not found in this organization`,
      );
    }
  }
}

function buildStorageKey(
  organizationId: string,
  documentId: string,
  versionNumber: number,
  filename: string,
): string {
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `organizations/${organizationId}/documents/${documentId}/v${versionNumber}/${sanitized}`;
}
