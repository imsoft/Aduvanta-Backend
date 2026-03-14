import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, SQL } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  importJobs,
  type ImportJobStatus,
} from '../../database/schema/index.js';

export type ImportJobRecord = typeof importJobs.$inferSelect;
export type NewImportJob = typeof importJobs.$inferInsert;

export interface ListImportJobsFilter {
  organizationId: string;
  status?: ImportJobStatus;
}

@Injectable()
export class ImportsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async insert(entry: NewImportJob): Promise<ImportJobRecord> {
    const [record] = await this.db
      .insert(importJobs)
      .values(entry)
      .returning();
    return record;
  }

  async findById(id: string): Promise<ImportJobRecord | undefined> {
    const result = await this.db
      .select()
      .from(importJobs)
      .where(eq(importJobs.id, id))
      .limit(1);
    return result[0];
  }

  async findByOrganization(filter: ListImportJobsFilter): Promise<ImportJobRecord[]> {
    const conditions: SQL[] = [eq(importJobs.organizationId, filter.organizationId)];

    if (filter.status) {
      conditions.push(eq(importJobs.status, filter.status));
    }

    return this.db
      .select()
      .from(importJobs)
      .where(and(...conditions))
      .orderBy(desc(importJobs.createdAt));
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<NewImportJob>,
  ): Promise<ImportJobRecord | undefined> {
    const result = await this.db
      .update(importJobs)
      .set(data)
      .where(and(eq(importJobs.id, id), eq(importJobs.organizationId, organizationId)))
      .returning();
    return result[0];
  }
}
