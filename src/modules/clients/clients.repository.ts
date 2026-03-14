import { Inject, Injectable } from '@nestjs/common';
import { and, eq, ilike, or, SQL } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { clients, type ClientStatus } from '../../database/schema/index.js';

export type ClientRecord = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export interface ListClientsFilter {
  organizationId: string;
  search?: string;
  status?: ClientStatus;
  limit: number;
  offset: number;
}

@Injectable()
export class ClientsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async insert(entry: NewClient): Promise<ClientRecord> {
    const [record] = await this.db.insert(clients).values(entry).returning();
    return record;
  }

  async findById(id: string): Promise<ClientRecord | undefined> {
    const result = await this.db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);
    return result[0];
  }

  async findByOrganization(filter: ListClientsFilter): Promise<ClientRecord[]> {
    const conditions: SQL[] = [eq(clients.organizationId, filter.organizationId)];

    if (filter.status) {
      conditions.push(eq(clients.status, filter.status));
    }

    if (filter.search) {
      const term = `%${filter.search}%`;
      conditions.push(
        or(
          ilike(clients.name, term),
          ilike(clients.legalName, term),
          ilike(clients.taxId, term),
          ilike(clients.email, term),
        ) as SQL,
      );
    }

    return this.db
      .select()
      .from(clients)
      .where(and(...conditions))
      .limit(filter.limit)
      .offset(filter.offset);
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<NewClient>,
  ): Promise<ClientRecord | undefined> {
    const result = await this.db
      .update(clients)
      .set(data)
      .where(and(eq(clients.id, id), eq(clients.organizationId, organizationId)))
      .returning();
    return result[0];
  }
}
