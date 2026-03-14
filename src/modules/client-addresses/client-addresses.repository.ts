import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import { clientAddresses } from '../../database/schema/index.js';

export type ClientAddressRecord = typeof clientAddresses.$inferSelect;
export type NewClientAddress = typeof clientAddresses.$inferInsert;

@Injectable()
export class ClientAddressesRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async insert(entry: NewClientAddress): Promise<ClientAddressRecord> {
    const [record] = await this.db
      .insert(clientAddresses)
      .values(entry)
      .returning();
    return record;
  }

  async findById(id: string): Promise<ClientAddressRecord | undefined> {
    const result = await this.db
      .select()
      .from(clientAddresses)
      .where(eq(clientAddresses.id, id))
      .limit(1);
    return result[0];
  }

  async findByClient(
    clientId: string,
    organizationId: string,
  ): Promise<ClientAddressRecord[]> {
    return this.db
      .select()
      .from(clientAddresses)
      .where(
        and(
          eq(clientAddresses.clientId, clientId),
          eq(clientAddresses.organizationId, organizationId),
        ),
      );
  }

  async clearPrimary(clientId: string, organizationId: string): Promise<void> {
    await this.db
      .update(clientAddresses)
      .set({ isPrimary: false })
      .where(
        and(
          eq(clientAddresses.clientId, clientId),
          eq(clientAddresses.organizationId, organizationId),
          eq(clientAddresses.isPrimary, true),
        ),
      );
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<NewClientAddress>,
  ): Promise<ClientAddressRecord | undefined> {
    const result = await this.db
      .update(clientAddresses)
      .set(data)
      .where(
        and(
          eq(clientAddresses.id, id),
          eq(clientAddresses.organizationId, organizationId),
        ),
      )
      .returning();
    return result[0];
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await this.db
      .delete(clientAddresses)
      .where(
        and(
          eq(clientAddresses.id, id),
          eq(clientAddresses.organizationId, organizationId),
        ),
      );
  }
}
