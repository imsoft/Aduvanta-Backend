import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { clientPortalAccess } from '../../database/schema/index.js';

export type ClientPortalAccessRecord = typeof clientPortalAccess.$inferSelect;
export type NewClientPortalAccess = typeof clientPortalAccess.$inferInsert;

@Injectable()
export class ClientPortalAccessRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async insert(entry: NewClientPortalAccess): Promise<ClientPortalAccessRecord> {
    const [record] = await this.db
      .insert(clientPortalAccess)
      .values(entry)
      .returning();
    return record;
  }

  async findById(id: string): Promise<ClientPortalAccessRecord | undefined> {
    const result = await this.db
      .select()
      .from(clientPortalAccess)
      .where(eq(clientPortalAccess.id, id))
      .limit(1);
    return result[0];
  }

  async findByClientAndOrg(
    clientId: string,
    organizationId: string,
  ): Promise<ClientPortalAccessRecord[]> {
    return this.db
      .select()
      .from(clientPortalAccess)
      .where(
        and(
          eq(clientPortalAccess.clientId, clientId),
          eq(clientPortalAccess.organizationId, organizationId),
        ),
      );
  }

  async findByUserAndOrg(
    userId: string,
    organizationId: string,
  ): Promise<ClientPortalAccessRecord[]> {
    return this.db
      .select()
      .from(clientPortalAccess)
      .where(
        and(
          eq(clientPortalAccess.userId, userId),
          eq(clientPortalAccess.organizationId, organizationId),
        ),
      );
  }

  async findByUserClientAndOrg(
    userId: string,
    clientId: string,
    organizationId: string,
  ): Promise<ClientPortalAccessRecord | undefined> {
    const result = await this.db
      .select()
      .from(clientPortalAccess)
      .where(
        and(
          eq(clientPortalAccess.userId, userId),
          eq(clientPortalAccess.clientId, clientId),
          eq(clientPortalAccess.organizationId, organizationId),
        ),
      )
      .limit(1);
    return result[0];
  }

  async deleteById(id: string, organizationId: string): Promise<void> {
    await this.db
      .delete(clientPortalAccess)
      .where(
        and(
          eq(clientPortalAccess.id, id),
          eq(clientPortalAccess.organizationId, organizationId),
        ),
      );
  }
}
