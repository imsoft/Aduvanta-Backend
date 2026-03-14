import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import { ClientPortalAccessRepository } from '../client-portal-access/client-portal-access.repository.js';
import { StorageService } from '../storage/storage.service.js';
import type { OperationRecord, OperationStatusHistoryRecord } from '../operations/operations.repository.js';
import { OperationsRepository } from '../operations/operations.repository.js';
import type { OperationCommentRecord } from '../operation-comments/operation-comments.repository.js';
import type { DocumentRecord } from '../documents/documents.repository.js';
import { PortalRepository } from './portal.repository.js';
import type { ListPortalOperationsDto } from './dto/list-portal-operations.dto.js';
import type { OperationStatus } from '../../database/schema/index.js';

const PORTAL_SIGNED_URL_EXPIRES_IN = 3600; // 1 hour

@Injectable()
export class PortalService {
  constructor(
    private readonly portalRepository: PortalRepository,
    private readonly portalAccessRepository: ClientPortalAccessRepository,
    private readonly operationsRepository: OperationsRepository,
    private readonly storageService: StorageService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async listOperations(
    userId: string,
    organizationId: string,
    dto: ListPortalOperationsDto,
  ): Promise<OperationRecord[]> {
    const clientIds = await this.resolveClientIds(userId, organizationId);

    return this.portalRepository.findOperations({
      organizationId,
      clientIds,
      search: dto.search,
      status: dto.status as OperationStatus | undefined,
      limit: dto.limit,
      offset: dto.offset,
    });
  }

  async getOperation(
    operationId: string,
    userId: string,
    organizationId: string,
  ): Promise<OperationRecord> {
    const clientIds = await this.resolveClientIds(userId, organizationId);

    const operation = await this.portalRepository.findOperationById(
      operationId,
      organizationId,
      clientIds,
    );

    if (!operation) {
      throw new NotFoundException(`Operation ${operationId} not found`);
    }

    return operation;
  }

  async getStatusHistory(
    operationId: string,
    userId: string,
    organizationId: string,
  ): Promise<OperationStatusHistoryRecord[]> {
    await this.getOperation(operationId, userId, organizationId);
    return this.operationsRepository.findStatusHistory(operationId, organizationId);
  }

  async listComments(
    operationId: string,
    userId: string,
    organizationId: string,
  ): Promise<OperationCommentRecord[]> {
    await this.getOperation(operationId, userId, organizationId);

    return this.portalRepository.findClientVisibleComments(operationId, organizationId);
  }

  async listDocuments(
    operationId: string,
    userId: string,
    organizationId: string,
  ): Promise<DocumentRecord[]> {
    await this.getOperation(operationId, userId, organizationId);

    return this.portalRepository.findClientVisibleDocuments(operationId, organizationId);
  }

  async getDocumentDownloadUrl(
    documentId: string,
    userId: string,
    organizationId: string,
  ): Promise<{ url: string; expiresInSeconds: number }> {
    const document = await this.portalRepository.findDocumentById(documentId, organizationId);

    if (!document) {
      throw new NotFoundException(`Document ${documentId} not found`);
    }

    // Validate the portal user has access to the operation's client.
    const clientIds = await this.resolveClientIds(userId, organizationId);

    // Load the operation to validate client scope.
    const operation = await this.portalRepository.findOperationById(
      document.operationId,
      organizationId,
      clientIds,
    );

    if (!operation) {
      throw new ForbiddenException('Access denied to this document');
    }

    const url = await this.storageService.getPresignedUrl(
      document.storageKey,
      PORTAL_SIGNED_URL_EXPIRES_IN,
    );

    await this.auditLogsService.log({
      organizationId,
      actorId: userId,
      action: AUDIT_ACTION.PORTAL_DOCUMENT_DOWNLOADED,
      resource: 'document',
      resourceId: documentId,
      metadata: { operationId: document.operationId, storageKey: document.storageKey },
    });

    return { url, expiresInSeconds: PORTAL_SIGNED_URL_EXPIRES_IN };
  }

  private async resolveClientIds(
    userId: string,
    organizationId: string,
  ): Promise<string[]> {
    const accessRecords = await this.portalAccessRepository.findByUserAndOrg(
      userId,
      organizationId,
    );
    return accessRecords.map((r) => r.clientId);
  }
}
