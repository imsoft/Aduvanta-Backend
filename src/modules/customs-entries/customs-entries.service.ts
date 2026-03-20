import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  CustomsEntriesRepository,
  type CustomsEntryRecord,
  type CustomsEntryItemRecord,
  type CustomsEntryPartyRecord,
  type CustomsEntryDocumentRecord,
  type CustomsOfficeRecord,
  type CustomsPatentRecord,
} from './customs-entries.repository.js';
import type { CreateCustomsEntryDto } from './dto/create-customs-entry.dto.js';
import type { UpdateCustomsEntryDto } from './dto/update-customs-entry.dto.js';
import type { AddEntryItemDto } from './dto/add-entry-item.dto.js';
import type { AddEntryPartyDto } from './dto/add-entry-party.dto.js';
import type { AddEntryDocumentDto } from './dto/add-entry-document.dto.js';
import type { ChangeEntryStatusDto } from './dto/change-entry-status.dto.js';

// Statuses that allow editing
const EDITABLE_STATUSES = new Set(['DRAFT', 'PREVALIDATED']);

// Valid status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PREVALIDATED', 'CANCELLED'],
  PREVALIDATED: ['VALIDATED', 'DRAFT', 'CANCELLED'],
  VALIDATED: ['PAID', 'CANCELLED'],
  PAID: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['RELEASED', 'CANCELLED'],
  RELEASED: ['RECTIFIED'],
  CANCELLED: [],
  RECTIFIED: [],
};

@Injectable()
export class CustomsEntriesService {
  constructor(
    private readonly repository: CustomsEntriesRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  // --- Customs Offices ---

  async listOffices(): Promise<CustomsOfficeRecord[]> {
    return this.repository.findAllOffices();
  }

  async getOfficeById(id: string): Promise<CustomsOfficeRecord> {
    const office = await this.repository.findOfficeById(id);

    if (!office) {
      throw new NotFoundException(`Customs office ${id} not found`);
    }

    return office;
  }

  async createOffice(
    data: { code: string; name: string; location?: string; sortOrder: number },
    actorId: string,
    organizationId: string,
  ): Promise<CustomsOfficeRecord> {
    const office = await this.repository.insertOffice(data);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CUSTOMS_OFFICE_CREATED,
      resource: 'customs_office',
      resourceId: office.id,
      metadata: { code: office.code, name: office.name },
    });

    return office;
  }

  // --- Customs Patents ---

  async listPatents(organizationId: string): Promise<CustomsPatentRecord[]> {
    return this.repository.findPatentsByOrganization(organizationId);
  }

  async getPatentById(id: string): Promise<CustomsPatentRecord> {
    const patent = await this.repository.findPatentById(id);

    if (!patent) {
      throw new NotFoundException(`Customs patent ${id} not found`);
    }

    return patent;
  }

  async createPatent(
    data: {
      organizationId: string;
      patentNumber: string;
      brokerName: string;
    },
    actorId: string,
  ): Promise<CustomsPatentRecord> {
    const patent = await this.repository.insertPatent(data);

    await this.auditLogsService.log({
      organizationId: data.organizationId,
      actorId,
      action: AUDIT_ACTION.CUSTOMS_PATENT_CREATED,
      resource: 'customs_patent',
      resourceId: patent.id,
      metadata: {
        patentNumber: patent.patentNumber,
        brokerName: patent.brokerName,
      },
    });

    return patent;
  }

  // --- Customs Entries ---

  async listEntries(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ entries: CustomsEntryRecord[]; total: number }> {
    return this.repository.findEntriesByOrganization(
      organizationId,
      limit,
      offset,
    );
  }

  async searchEntries(
    organizationId: string,
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ entries: CustomsEntryRecord[]; total: number }> {
    return this.repository.searchEntries(organizationId, query, limit, offset);
  }

  async getEntryById(
    id: string,
    organizationId: string,
  ): Promise<CustomsEntryRecord> {
    const entry = await this.repository.findEntryByIdAndOrg(id, organizationId);

    if (!entry) {
      throw new NotFoundException(`Customs entry ${id} not found`);
    }

    return entry;
  }

  async getEntryDetails(id: string, organizationId: string) {
    const entry = await this.getEntryById(id, organizationId);
    const [items, parties, documents, statusHistory] = await Promise.all([
      this.repository.findItemsByEntry(id),
      this.repository.findPartiesByEntry(id),
      this.repository.findDocumentsByEntry(id),
      this.repository.findStatusHistory(id),
    ]);

    return {
      ...entry,
      items,
      parties,
      documents,
      statusHistory,
    };
  }

  async createEntry(
    dto: CreateCustomsEntryDto,
    actorId: string,
    organizationId: string,
  ): Promise<CustomsEntryRecord> {
    await this.getOfficeById(dto.customsOfficeId);

    const patent = await this.getPatentById(dto.patentId);
    if (patent.organizationId !== organizationId) {
      throw new ForbiddenException(
        'Patent does not belong to this organization',
      );
    }

    const entry = await this.repository.insertEntry({
      organizationId,
      customsOfficeId: dto.customsOfficeId,
      patentId: dto.patentId,
      entryKey: dto.entryKey,
      regime: dto.regime,
      operationType: dto.operationType,
      entryDate: dto.entryDate,
      transportMode: dto.transportMode,
      carrierName: dto.carrierName,
      transportDocumentNumber: dto.transportDocumentNumber,
      originCountry: dto.originCountry,
      destinationCountry: dto.destinationCountry,
      exchangeRate: dto.exchangeRate,
      invoiceCurrency: dto.invoiceCurrency,
      internalReference: dto.internalReference,
      observations: dto.observations,
      createdById: actorId,
      status: 'DRAFT',
    });

    await this.repository.insertStatusHistory({
      entryId: entry.id,
      newStatus: 'DRAFT',
      changedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CUSTOMS_ENTRY_CREATED,
      resource: 'customs_entry',
      resourceId: entry.id,
      metadata: {
        entryKey: entry.entryKey,
        regime: entry.regime,
        customsOfficeId: entry.customsOfficeId,
      },
    });

    return entry;
  }

  async updateEntry(
    id: string,
    dto: UpdateCustomsEntryDto,
    actorId: string,
    organizationId: string,
  ): Promise<CustomsEntryRecord> {
    const entry = await this.getEntryById(id, organizationId);
    this.assertEditable(entry);

    const updated = await this.repository.updateEntry(id, {
      ...dto,
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CUSTOMS_ENTRY_UPDATED,
      resource: 'customs_entry',
      resourceId: id,
      metadata: { ...dto },
    });

    return updated;
  }

  async deleteEntry(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const entry = await this.getEntryById(id, organizationId);

    if (entry.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only draft entries can be deleted. Cancel the entry instead.',
      );
    }

    await this.repository.deleteEntry(id);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CUSTOMS_ENTRY_DELETED,
      resource: 'customs_entry',
      resourceId: id,
      metadata: { entryKey: entry.entryKey, entryNumber: entry.entryNumber },
    });
  }

  async changeStatus(
    id: string,
    dto: ChangeEntryStatusDto,
    actorId: string,
    organizationId: string,
  ): Promise<CustomsEntryRecord> {
    const entry = await this.getEntryById(id, organizationId);

    const allowed = STATUS_TRANSITIONS[entry.status];
    if (!allowed || !allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${entry.status} to ${dto.status}`,
      );
    }

    const updated = await this.repository.updateEntry(id, {
      status: dto.status,
      updatedById: actorId,
    });

    await this.repository.insertStatusHistory({
      entryId: id,
      previousStatus: entry.status,
      newStatus: dto.status,
      changedById: actorId,
      reason: dto.reason,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CUSTOMS_ENTRY_STATUS_CHANGED,
      resource: 'customs_entry',
      resourceId: id,
      metadata: {
        previousStatus: entry.status,
        newStatus: dto.status,
        reason: dto.reason,
      },
    });

    return updated;
  }

  // --- Entry Items ---

  async listItems(
    entryId: string,
    organizationId: string,
  ): Promise<CustomsEntryItemRecord[]> {
    await this.getEntryById(entryId, organizationId);
    return this.repository.findItemsByEntry(entryId);
  }

  async addItem(
    entryId: string,
    dto: AddEntryItemDto,
    actorId: string,
    organizationId: string,
  ): Promise<CustomsEntryItemRecord> {
    const entry = await this.getEntryById(entryId, organizationId);
    this.assertEditable(entry);

    const item = await this.repository.insertItem({
      entryId,
      ...dto,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CUSTOMS_ENTRY_ITEM_ADDED,
      resource: 'customs_entry_item',
      resourceId: item.id,
      metadata: {
        entryId,
        itemNumber: item.itemNumber,
        tariffFractionCode: item.tariffFractionCode,
      },
    });

    return item;
  }

  async removeItem(
    entryId: string,
    itemId: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const entry = await this.getEntryById(entryId, organizationId);
    this.assertEditable(entry);

    const item = await this.repository.findItemById(itemId);
    if (!item || item.entryId !== entryId) {
      throw new NotFoundException(`Item ${itemId} not found in entry`);
    }

    await this.repository.deleteItem(itemId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CUSTOMS_ENTRY_ITEM_REMOVED,
      resource: 'customs_entry_item',
      resourceId: itemId,
      metadata: {
        entryId,
        itemNumber: item.itemNumber,
        tariffFractionCode: item.tariffFractionCode,
      },
    });
  }

  // --- Entry Parties ---

  async listParties(
    entryId: string,
    organizationId: string,
  ): Promise<CustomsEntryPartyRecord[]> {
    await this.getEntryById(entryId, organizationId);
    return this.repository.findPartiesByEntry(entryId);
  }

  async addParty(
    entryId: string,
    dto: AddEntryPartyDto,
    actorId: string,
    organizationId: string,
  ): Promise<CustomsEntryPartyRecord> {
    const entry = await this.getEntryById(entryId, organizationId);
    this.assertEditable(entry);

    const party = await this.repository.insertParty({
      entryId,
      ...dto,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CUSTOMS_ENTRY_PARTY_ADDED,
      resource: 'customs_entry_party',
      resourceId: party.id,
      metadata: { entryId, role: party.role, taxId: party.taxId },
    });

    return party;
  }

  async removeParty(
    entryId: string,
    partyId: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    await this.getEntryById(entryId, organizationId);

    await this.repository.deleteParty(partyId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CUSTOMS_ENTRY_PARTY_REMOVED,
      resource: 'customs_entry_party',
      resourceId: partyId,
      metadata: { entryId },
    });
  }

  // --- Entry Documents ---

  async listDocuments(
    entryId: string,
    organizationId: string,
  ): Promise<CustomsEntryDocumentRecord[]> {
    await this.getEntryById(entryId, organizationId);
    return this.repository.findDocumentsByEntry(entryId);
  }

  async addDocument(
    entryId: string,
    dto: AddEntryDocumentDto,
    actorId: string,
    organizationId: string,
  ): Promise<CustomsEntryDocumentRecord> {
    await this.getEntryById(entryId, organizationId);

    const doc = await this.repository.insertDocument({
      entryId,
      ...dto,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CUSTOMS_ENTRY_DOCUMENT_ADDED,
      resource: 'customs_entry_document',
      resourceId: doc.id,
      metadata: {
        entryId,
        documentTypeCode: doc.documentTypeCode,
        documentNumber: doc.documentNumber,
      },
    });

    return doc;
  }

  async removeDocument(
    entryId: string,
    documentId: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    await this.getEntryById(entryId, organizationId);

    await this.repository.deleteDocument(documentId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.CUSTOMS_ENTRY_DOCUMENT_REMOVED,
      resource: 'customs_entry_document',
      resourceId: documentId,
      metadata: { entryId },
    });
  }

  // --- Status History ---

  async getStatusHistory(entryId: string, organizationId: string) {
    await this.getEntryById(entryId, organizationId);
    return this.repository.findStatusHistory(entryId);
  }

  // --- Private Helpers ---

  private assertEditable(entry: CustomsEntryRecord): void {
    if (!EDITABLE_STATUSES.has(entry.status)) {
      throw new BadRequestException(
        `Entry in status ${entry.status} cannot be edited`,
      );
    }
  }
}
