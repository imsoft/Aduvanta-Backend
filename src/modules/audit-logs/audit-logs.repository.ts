import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { auditLogs } from '../../database/schema/index.js';

export type AuditLogRecord = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

@Injectable()
export class AuditLogsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async insert(entry: NewAuditLog): Promise<AuditLogRecord> {
    const [record] = await this.db.insert(auditLogs).values(entry).returning();

    return record;
  }

  async findByOrganization(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<AuditLogRecord[]> {
    return this.db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.organizationId, organizationId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }
}
