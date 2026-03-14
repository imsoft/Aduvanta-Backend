import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import { StorageService } from '../storage/storage.service.js';
import { ClientsRepository } from '../clients/clients.repository.js';
import { OperationsRepository } from '../operations/operations.repository.js';
import type { ExportJobRecord } from './exports.repository.js';
import { ExportsRepository } from './exports.repository.js';
import type { CreateExportJobDto } from './dto/create-export-job.dto.js';
import type { ListExportJobsDto } from './dto/list-export-jobs.dto.js';

const DOWNLOAD_URL_EXPIRES_IN = 3600; // 1 hour

@Injectable()
export class ExportsService {
  constructor(
    private readonly exportsRepository: ExportsRepository,
    private readonly clientsRepository: ClientsRepository,
    private readonly operationsRepository: OperationsRepository,
    private readonly storageService: StorageService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async list(
    organizationId: string,
    dto: ListExportJobsDto,
  ): Promise<ExportJobRecord[]> {
    return this.exportsRepository.findByOrganization({
      organizationId,
      status: dto.status,
      type: dto.type,
    });
  }

  async create(
    organizationId: string,
    dto: CreateExportJobDto,
    actorId: string,
  ): Promise<ExportJobRecord> {
    const job = await this.exportsRepository.insert({
      organizationId,
      type: dto.type,
      status: 'PROCESSING',
      requestedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.EXPORT_REQUESTED,
      resource: 'export_job',
      resourceId: job.id,
      metadata: { type: dto.type },
    });

    // Process synchronously in V1.
    try {
      const updated = await this.processExport(job.id, organizationId, dto.type, actorId);
      return updated;
    } catch (err) {
      const failed = await this.exportsRepository.update(job.id, organizationId, {
        status: 'FAILED',
        completedAt: new Date(),
      });

      await this.auditLogsService.log({
        organizationId,
        actorId,
        action: AUDIT_ACTION.EXPORT_FAILED,
        resource: 'export_job',
        resourceId: job.id,
        metadata: {
          type: dto.type,
          error: err instanceof Error ? err.message : String(err),
        },
      });

      return failed ?? job;
    }
  }

  async getById(id: string, organizationId: string): Promise<ExportJobRecord> {
    const record = await this.exportsRepository.findById(id);

    if (!record || record.organizationId !== organizationId) {
      throw new NotFoundException(`Export job ${id} not found`);
    }

    return record;
  }

  async getDownloadUrl(id: string, organizationId: string): Promise<{ url: string }> {
    const job = await this.getById(id, organizationId);

    if (!job.storageKey) {
      throw new NotFoundException(`Export job ${id} has no file available`);
    }

    const url = await this.storageService.getPresignedUrl(
      job.storageKey,
      DOWNLOAD_URL_EXPIRES_IN,
    );

    return { url };
  }

  private async processExport(
    jobId: string,
    organizationId: string,
    type: 'CLIENTS' | 'OPERATIONS' | 'FINANCE',
    actorId: string,
  ): Promise<ExportJobRecord> {
    let csv: string;
    const fileName = `${type.toLowerCase()}-export-${Date.now()}.csv`;

    if (type === 'CLIENTS') {
      const clients = await this.clientsRepository.findByOrganization({
        organizationId,
        limit: 10_000,
        offset: 0,
      });
      csv = this.buildClientsCsv(clients);
    } else if (type === 'OPERATIONS') {
      const operations = await this.operationsRepository.findByOrganization({
        organizationId,
        limit: 10_000,
        offset: 0,
      });
      csv = this.buildOperationsCsv(operations);
    } else {
      // FINANCE: export a summary of operations with their references
      const operations = await this.operationsRepository.findByOrganization({
        organizationId,
        limit: 10_000,
        offset: 0,
      });
      csv = this.buildFinanceCsv(operations);
    }

    const storageKey = `exports/${organizationId}/${jobId}/${fileName}`;

    await this.storageService.upload(
      storageKey,
      Buffer.from(csv, 'utf-8'),
      'text/csv',
    );

    const updated = await this.exportsRepository.update(jobId, organizationId, {
      status: 'COMPLETED',
      fileName,
      storageKey,
      completedAt: new Date(),
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.EXPORT_COMPLETED,
      resource: 'export_job',
      resourceId: jobId,
      metadata: { type, fileName },
    });

    return updated!;
  }

  private buildClientsCsv(clients: { id: string; name: string; taxId: string | null; email: string | null; phone: string | null; status: string; createdAt: Date }[]): string {
    const header = 'id,name,taxId,email,phone,status,createdAt';
    const rows = clients.map((c) =>
      [c.id, this.escapeCsv(c.name), c.taxId ?? '', c.email ?? '', c.phone ?? '', c.status, c.createdAt.toISOString()].join(','),
    );
    return [header, ...rows].join('\n');
  }

  private buildOperationsCsv(operations: { id: string; reference: string; title: string; type: string; status: string; priority: string; createdAt: Date }[]): string {
    const header = 'id,reference,title,type,status,priority,createdAt';
    const rows = operations.map((o) =>
      [o.id, this.escapeCsv(o.reference), this.escapeCsv(o.title), o.type, o.status, o.priority, o.createdAt.toISOString()].join(','),
    );
    return [header, ...rows].join('\n');
  }

  private buildFinanceCsv(operations: { id: string; reference: string; title: string; status: string; createdAt: Date }[]): string {
    const header = 'operationId,reference,title,status,createdAt';
    const rows = operations.map((o) =>
      [o.id, this.escapeCsv(o.reference), this.escapeCsv(o.title), o.status, o.createdAt.toISOString()].join(','),
    );
    return [header, ...rows].join('\n');
  }

  private escapeCsv(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
