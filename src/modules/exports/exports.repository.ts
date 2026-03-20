import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, SQL } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  exportJobs,
  type ExportJobStatus,
  type ExportType,
} from '../../database/schema/index.js';

export type ExportJobRecord = typeof exportJobs.$inferSelect;
export type NewExportJob = typeof exportJobs.$inferInsert;

export interface ListExportJobsFilter {
  organizationId: string;
  status?: ExportJobStatus;
  type?: ExportType;
}

@Injectable()
export class ExportsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async insert(entry: NewExportJob): Promise<ExportJobRecord> {
    const [record] = await this.db.insert(exportJobs).values(entry).returning();
    return record;
  }

  async findById(id: string): Promise<ExportJobRecord | undefined> {
    const result = await this.db
      .select()
      .from(exportJobs)
      .where(eq(exportJobs.id, id))
      .limit(1);
    return result[0];
  }

  async findByOrganization(
    filter: ListExportJobsFilter,
  ): Promise<ExportJobRecord[]> {
    const conditions: SQL[] = [
      eq(exportJobs.organizationId, filter.organizationId),
    ];

    if (filter.status) {
      conditions.push(eq(exportJobs.status, filter.status));
    }

    if (filter.type) {
      conditions.push(eq(exportJobs.type, filter.type));
    }

    return this.db
      .select()
      .from(exportJobs)
      .where(and(...conditions))
      .orderBy(desc(exportJobs.createdAt));
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<NewExportJob>,
  ): Promise<ExportJobRecord | undefined> {
    const result = await this.db
      .update(exportJobs)
      .set(data)
      .where(
        and(
          eq(exportJobs.id, id),
          eq(exportJobs.organizationId, organizationId),
        ),
      )
      .returning();
    return result[0];
  }
}
