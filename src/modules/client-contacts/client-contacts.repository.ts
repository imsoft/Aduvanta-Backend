import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { clientContacts } from '../../database/schema/index.js';

export type ClientContactRecord = typeof clientContacts.$inferSelect;
export type NewClientContact = typeof clientContacts.$inferInsert;

@Injectable()
export class ClientContactsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async insert(entry: NewClientContact): Promise<ClientContactRecord> {
    const [record] = await this.db
      .insert(clientContacts)
      .values(entry)
      .returning();
    return record;
  }

  async findById(id: string): Promise<ClientContactRecord | undefined> {
    const result = await this.db
      .select()
      .from(clientContacts)
      .where(eq(clientContacts.id, id))
      .limit(1);
    return result[0];
  }

  async findByClient(
    clientId: string,
    organizationId: string,
  ): Promise<ClientContactRecord[]> {
    return this.db
      .select()
      .from(clientContacts)
      .where(
        and(
          eq(clientContacts.clientId, clientId),
          eq(clientContacts.organizationId, organizationId),
        ),
      );
  }

  async clearPrimary(clientId: string, organizationId: string): Promise<void> {
    await this.db
      .update(clientContacts)
      .set({ isPrimary: false })
      .where(
        and(
          eq(clientContacts.clientId, clientId),
          eq(clientContacts.organizationId, organizationId),
          eq(clientContacts.isPrimary, true),
        ),
      );
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<NewClientContact>,
  ): Promise<ClientContactRecord | undefined> {
    const result = await this.db
      .update(clientContacts)
      .set(data)
      .where(
        and(
          eq(clientContacts.id, id),
          eq(clientContacts.organizationId, organizationId),
        ),
      )
      .returning();
    return result[0];
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await this.db
      .delete(clientContacts)
      .where(
        and(
          eq(clientContacts.id, id),
          eq(clientContacts.organizationId, organizationId),
        ),
      );
  }
}
