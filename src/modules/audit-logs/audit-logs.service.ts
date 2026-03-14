import { Injectable } from '@nestjs/common';
import { AuditLogsRepository } from './audit-logs.repository.js';
import type { AuditAction } from './audit-log.actions.js';
import type { AuditLogRecord } from './audit-logs.repository.js';

export interface LogAuditEventParams {
  organizationId: string;
  actorId: string;
  action: AuditAction;
  resource: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogsService {
  constructor(private readonly auditLogsRepository: AuditLogsRepository) {}

  async log(params: LogAuditEventParams): Promise<AuditLogRecord> {
    return this.auditLogsRepository.insert(params);
  }

  async listForOrganization(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<AuditLogRecord[]> {
    return this.auditLogsRepository.findByOrganization(
      organizationId,
      limit,
      offset,
    );
  }
}
