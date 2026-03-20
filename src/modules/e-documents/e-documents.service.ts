import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  EDocumentsRepository,
  type EDocumentRecord,
  type EDocumentItemRecord,
  type EDocumentTransmissionRecord,
} from './e-documents.repository.js';
import type { CreateEDocumentDto } from './dto/create-e-document.dto.js';
import type { UpdateEDocumentDto } from './dto/update-e-document.dto.js';
import type { ChangeEDocumentStatusDto } from './dto/change-e-document-status.dto.js';
import type { AddEDocumentItemDto } from './dto/add-e-document-item.dto.js';
import type { UpdateEDocumentItemDto } from './dto/update-e-document-item.dto.js';

const EDITABLE_STATUSES = new Set(['DRAFT', 'REJECTED']);

const STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['VALIDATING'],
  VALIDATING: ['TRANSMITTED', 'DRAFT'],
  TRANSMITTED: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['CANCELLED'],
  REJECTED: ['DRAFT'],
  CANCELLED: [],
};

@Injectable()
export class EDocumentsService {
  constructor(
    private readonly repository: EDocumentsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  // --- E-Documents ---

  async listDocuments(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ eDocuments: EDocumentRecord[]; total: number }> {
    return this.repository.findByOrganization(organizationId, limit, offset);
  }

  async searchDocuments(
    organizationId: string,
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ eDocuments: EDocumentRecord[]; total: number }> {
    return this.repository.search(organizationId, query, limit, offset);
  }

  async getDocumentById(
    id: string,
    organizationId: string,
  ): Promise<EDocumentRecord> {
    const doc = await this.repository.findByIdAndOrg(id, organizationId);

    if (!doc) {
      throw new NotFoundException(`E-Document ${id} not found`);
    }

    return doc;
  }

  async getDocumentDetails(id: string, organizationId: string) {
    const doc = await this.getDocumentById(id, organizationId);
    const [items, transmissions] = await Promise.all([
      this.repository.findItemsByDocument(id),
      this.repository.findTransmissionsByDocument(id),
    ]);

    return { ...doc, items, transmissions };
  }

  async createDocument(
    dto: CreateEDocumentDto,
    actorId: string,
    organizationId: string,
  ): Promise<EDocumentRecord> {
    const doc = await this.repository.insert({
      organizationId,
      entryId: dto.entryId,
      type: dto.type as 'COVE_IMPORT',
      documentNumber: dto.documentNumber,
      documentDate: dto.documentDate,
      sellerName: dto.sellerName,
      sellerTaxId: dto.sellerTaxId,
      sellerAddress: dto.sellerAddress,
      sellerCountry: dto.sellerCountry,
      buyerName: dto.buyerName,
      buyerTaxId: dto.buyerTaxId,
      buyerAddress: dto.buyerAddress,
      buyerCountry: dto.buyerCountry,
      invoiceNumber: dto.invoiceNumber,
      invoiceDate: dto.invoiceDate,
      invoiceCurrency: dto.invoiceCurrency,
      isSubdivided: dto.isSubdivided ?? false,
      parentEDocumentId: dto.parentEDocumentId,
      observations: dto.observations,
      createdById: actorId,
      status: 'DRAFT',
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.E_DOCUMENT_CREATED,
      resource: 'e_document',
      resourceId: doc.id,
      metadata: {
        type: doc.type,
        sellerName: doc.sellerName,
        buyerName: doc.buyerName,
      },
    });

    return doc;
  }

  async updateDocument(
    id: string,
    dto: UpdateEDocumentDto,
    actorId: string,
    organizationId: string,
  ): Promise<EDocumentRecord> {
    const existing = await this.getDocumentById(id, organizationId);

    if (!EDITABLE_STATUSES.has(existing.status)) {
      throw new BadRequestException(
        `Cannot edit e-document in status ${existing.status}`,
      );
    }

    const updated = await this.repository.update(id, {
      ...dto,
      type: dto.type as 'COVE_IMPORT' | undefined,
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.E_DOCUMENT_UPDATED,
      resource: 'e_document',
      resourceId: id,
      metadata: { ...dto },
    });

    return updated;
  }

  async deleteDocument(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const doc = await this.getDocumentById(id, organizationId);

    if (!EDITABLE_STATUSES.has(doc.status)) {
      throw new BadRequestException(
        `Cannot delete e-document in status ${doc.status}`,
      );
    }

    await this.repository.remove(id);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.E_DOCUMENT_DELETED,
      resource: 'e_document',
      resourceId: id,
      metadata: {
        coveNumber: doc.coveNumber,
        documentNumber: doc.documentNumber,
      },
    });
  }

  async changeStatus(
    id: string,
    dto: ChangeEDocumentStatusDto,
    actorId: string,
    organizationId: string,
  ): Promise<EDocumentRecord> {
    const doc = await this.getDocumentById(id, organizationId);

    const allowedTransitions = STATUS_TRANSITIONS[doc.status];
    if (!allowedTransitions || !allowedTransitions.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${doc.status} to ${dto.status}`,
      );
    }

    const updateData: Record<string, unknown> = {
      status: dto.status,
      updatedById: actorId,
    };

    if (dto.status === 'REJECTED') {
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = dto.reason;
    } else if (dto.status === 'ACCEPTED') {
      updateData.acceptedAt = new Date();
    } else if (dto.status === 'TRANSMITTED') {
      updateData.transmittedAt = new Date();
    }

    const updated = await this.repository.update(
      id,
      updateData as Partial<
        typeof import('../../database/schema/index.js').eDocuments.$inferInsert
      >,
    );

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.E_DOCUMENT_STATUS_CHANGED,
      resource: 'e_document',
      resourceId: id,
      metadata: {
        previousStatus: doc.status,
        newStatus: dto.status,
        reason: dto.reason,
      },
    });

    return updated;
  }

  // --- Transmit (placeholder for VUCEM integration) ---

  async transmitDocument(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<EDocumentTransmissionRecord> {
    const doc = await this.getDocumentById(id, organizationId);

    if (doc.status !== 'VALIDATING' && doc.status !== 'DRAFT') {
      throw new BadRequestException(
        `Cannot transmit e-document in status ${doc.status}`,
      );
    }

    // Create a transmission record (actual VUCEM call will be integrated later)
    const transmission = await this.repository.insertTransmission({
      eDocumentId: id,
      status: 'PENDING',
      triggeredById: actorId,
    });

    // Update document status to VALIDATING if still DRAFT
    if (doc.status === 'DRAFT') {
      await this.repository.update(id, {
        status: 'VALIDATING',
        updatedById: actorId,
      });
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.E_DOCUMENT_TRANSMITTED,
      resource: 'e_document',
      resourceId: id,
      metadata: {
        transmissionId: transmission.id,
        coveNumber: doc.coveNumber,
      },
    });

    return transmission;
  }

  // --- Items ---

  async listItems(
    eDocumentId: string,
    organizationId: string,
  ): Promise<EDocumentItemRecord[]> {
    await this.getDocumentById(eDocumentId, organizationId);
    return this.repository.findItemsByDocument(eDocumentId);
  }

  async addItem(
    eDocumentId: string,
    dto: AddEDocumentItemDto,
    actorId: string,
    organizationId: string,
  ): Promise<EDocumentItemRecord> {
    const doc = await this.getDocumentById(eDocumentId, organizationId);

    if (!EDITABLE_STATUSES.has(doc.status)) {
      throw new BadRequestException(
        `Cannot add items to e-document in status ${doc.status}`,
      );
    }

    const item = await this.repository.insertItem({
      eDocumentId,
      ...dto,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.E_DOCUMENT_ITEM_ADDED,
      resource: 'e_document_item',
      resourceId: item.id,
      metadata: {
        eDocumentId,
        itemNumber: item.itemNumber,
        description: item.description,
      },
    });

    return item;
  }

  async updateItem(
    eDocumentId: string,
    itemId: string,
    dto: UpdateEDocumentItemDto,
    actorId: string,
    organizationId: string,
  ): Promise<EDocumentItemRecord> {
    const doc = await this.getDocumentById(eDocumentId, organizationId);

    if (!EDITABLE_STATUSES.has(doc.status)) {
      throw new BadRequestException(
        `Cannot update items in e-document in status ${doc.status}`,
      );
    }

    const existing = await this.repository.findItemById(itemId);
    if (!existing || existing.eDocumentId !== eDocumentId) {
      throw new NotFoundException(`Item ${itemId} not found in e-document`);
    }

    const updated = await this.repository.updateItem(itemId, { ...dto });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.E_DOCUMENT_ITEM_UPDATED,
      resource: 'e_document_item',
      resourceId: itemId,
      metadata: { eDocumentId, ...dto },
    });

    return updated;
  }

  async removeItem(
    eDocumentId: string,
    itemId: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const doc = await this.getDocumentById(eDocumentId, organizationId);

    if (!EDITABLE_STATUSES.has(doc.status)) {
      throw new BadRequestException(
        `Cannot remove items from e-document in status ${doc.status}`,
      );
    }

    const existing = await this.repository.findItemById(itemId);
    if (!existing || existing.eDocumentId !== eDocumentId) {
      throw new NotFoundException(`Item ${itemId} not found in e-document`);
    }

    await this.repository.deleteItem(itemId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.E_DOCUMENT_ITEM_REMOVED,
      resource: 'e_document_item',
      resourceId: itemId,
      metadata: {
        eDocumentId,
        itemNumber: existing.itemNumber,
        description: existing.description,
      },
    });
  }

  // --- Transmissions (read-only for now) ---

  async listTransmissions(
    eDocumentId: string,
    organizationId: string,
  ): Promise<EDocumentTransmissionRecord[]> {
    await this.getDocumentById(eDocumentId, organizationId);
    return this.repository.findTransmissionsByDocument(eDocumentId);
  }
}
