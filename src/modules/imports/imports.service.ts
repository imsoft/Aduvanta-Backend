import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import { ClientsRepository } from '../clients/clients.repository.js';
import type { ImportJobRecord } from './imports.repository.js';
import { ImportsRepository } from './imports.repository.js';
import type { CreateImportJobDto } from './dto/create-import-job.dto.js';
import type { ListImportJobsDto } from './dto/list-import-jobs.dto.js';

interface ClientImportRow {
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
}

interface ImportResultSummary {
  processed: number;
  created: number;
  failed: number;
  errors: string[];
}

@Injectable()
export class ImportsService {
  constructor(
    private readonly importsRepository: ImportsRepository,
    private readonly clientsRepository: ClientsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async list(
    organizationId: string,
    dto: ListImportJobsDto,
  ): Promise<ImportJobRecord[]> {
    return this.importsRepository.findByOrganization({
      organizationId,
      status: dto.status,
    });
  }

  async create(
    organizationId: string,
    dto: CreateImportJobDto,
    csvContent: string,
    fileName: string,
    actorId: string,
  ): Promise<ImportJobRecord> {
    const job = await this.importsRepository.insert({
      organizationId,
      type: dto.type,
      status: 'PROCESSING',
      fileName,
      requestedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.IMPORT_STARTED,
      resource: 'import_job',
      resourceId: job.id,
      metadata: { type: dto.type, fileName },
    });

    try {
      const summary = await this.processImport(
        job.id,
        organizationId,
        dto.type,
        csvContent,
        actorId,
      );

      const updated = await this.importsRepository.update(
        job.id,
        organizationId,
        {
          status: 'COMPLETED',
          resultSummaryJson: JSON.stringify(summary),
          completedAt: new Date(),
        },
      );

      await this.auditLogsService.log({
        organizationId,
        actorId,
        action: AUDIT_ACTION.IMPORT_COMPLETED,
        resource: 'import_job',
        resourceId: job.id,
        metadata: { type: dto.type, ...summary },
      });

      return updated ?? job;
    } catch (err) {
      const failed = await this.importsRepository.update(
        job.id,
        organizationId,
        {
          status: 'FAILED',
          resultSummaryJson: JSON.stringify({
            processed: 0,
            created: 0,
            failed: 0,
            errors: [err instanceof Error ? err.message : String(err)],
          }),
          completedAt: new Date(),
        },
      );

      await this.auditLogsService.log({
        organizationId,
        actorId,
        action: AUDIT_ACTION.IMPORT_FAILED,
        resource: 'import_job',
        resourceId: job.id,
        metadata: {
          type: dto.type,
          error: err instanceof Error ? err.message : String(err),
        },
      });

      return failed ?? job;
    }
  }

  async getById(id: string, organizationId: string): Promise<ImportJobRecord> {
    const record = await this.importsRepository.findById(id);

    if (!record || record.organizationId !== organizationId) {
      throw new NotFoundException(`Import job ${id} not found`);
    }

    return record;
  }

  private async processImport(
    _jobId: string,
    organizationId: string,
    type: 'CLIENTS',
    csvContent: string,
    actorId: string,
  ): Promise<ImportResultSummary> {
    if (type === 'CLIENTS') {
      return this.importClients(organizationId, csvContent, actorId);
    }

    throw new BadRequestException(`Unsupported import type: ${type}`);
  }

  private async importClients(
    organizationId: string,
    csvContent: string,
    actorId: string,
  ): Promise<ImportResultSummary> {
    const lines = csvContent
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      throw new BadRequestException(
        'CSV must have a header row and at least one data row',
      );
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const nameIndex = headers.indexOf('name');

    if (nameIndex === -1) {
      throw new BadRequestException('CSV must include a "name" column');
    }

    const taxIdIndex = headers.indexOf('taxid');
    const emailIndex = headers.indexOf('email');
    const phoneIndex = headers.indexOf('phone');

    const summary: ImportResultSummary = {
      processed: 0,
      created: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      const row: ClientImportRow = {
        name: cols[nameIndex] ?? '',
        taxId: taxIdIndex !== -1 ? cols[taxIdIndex] || undefined : undefined,
        email: emailIndex !== -1 ? cols[emailIndex] || undefined : undefined,
        phone: phoneIndex !== -1 ? cols[phoneIndex] || undefined : undefined,
      };

      summary.processed++;

      if (!row.name) {
        summary.failed++;
        summary.errors.push(`Row ${i}: name is required`);
        continue;
      }

      try {
        await this.clientsRepository.insert({
          organizationId,
          name: row.name,
          taxId: row.taxId ?? null,
          email: row.email ?? null,
          phone: row.phone ?? null,
          status: 'ACTIVE',
          createdById: actorId,
        });
        summary.created++;
      } catch (err) {
        summary.failed++;
        summary.errors.push(
          `Row ${i}: ${err instanceof Error ? err.message : 'unknown error'}`,
        );
      }
    }

    return summary;
  }
}
