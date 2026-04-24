import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { DATABASE } from '../../database/database.module.js';
import type { Database } from '../../database/database.module.js';
import {
  clientAccountMovements,
  clientAccountStatements,
  clientFunds,
} from '../../database/schema/client-account-statements.schema.js';

export type AccountMovementRecord = typeof clientAccountMovements.$inferSelect;
export type AccountStatementRecord = typeof clientAccountStatements.$inferSelect;
export type ClientFundsRecord = typeof clientFunds.$inferSelect;

@Injectable()
export class ClientAccountsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findMovementsByClient(
    organizationId: string,
    clientId: string,
    limit: number,
    offset: number,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<{ movements: AccountMovementRecord[]; total: number }> {
    const conditions = [
      eq(clientAccountMovements.organizationId, organizationId),
      eq(clientAccountMovements.clientId, clientId),
    ];

    if (dateFrom) {
      conditions.push(gte(clientAccountMovements.movementDate, dateFrom));
    }
    if (dateTo) {
      conditions.push(lte(clientAccountMovements.movementDate, dateTo));
    }

    const where = and(...conditions);

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(clientAccountMovements)
        .where(where)
        .orderBy(
          desc(clientAccountMovements.movementDate),
          desc(clientAccountMovements.createdAt),
        )
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(clientAccountMovements)
        .where(where),
    ]);

    return { movements: rows, total: countResult[0].count };
  }

  async getClientBalance(
    organizationId: string,
    clientId: string,
  ): Promise<string> {
    const [result] = await this.db
      .select({
        balance: sql<string>`COALESCE(SUM(${clientAccountMovements.amount}), '0')`,
      })
      .from(clientAccountMovements)
      .where(
        and(
          eq(clientAccountMovements.organizationId, organizationId),
          eq(clientAccountMovements.clientId, clientId),
        ),
      );
    return result?.balance ?? '0';
  }

  async insertMovement(
    data: typeof clientAccountMovements.$inferInsert,
  ): Promise<AccountMovementRecord> {
    const [created] = await this.db
      .insert(clientAccountMovements)
      .values(data)
      .returning();
    return created;
  }

  async findStatementsByClient(
    organizationId: string,
    clientId: string,
    limit: number,
    offset: number,
  ): Promise<{ statements: AccountStatementRecord[]; total: number }> {
    const where = and(
      eq(clientAccountStatements.organizationId, organizationId),
      eq(clientAccountStatements.clientId, clientId),
    );

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(clientAccountStatements)
        .where(where)
        .orderBy(desc(clientAccountStatements.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(clientAccountStatements)
        .where(where),
    ]);

    return { statements: rows, total: countResult[0].count };
  }

  async insertStatement(
    data: typeof clientAccountStatements.$inferInsert,
  ): Promise<AccountStatementRecord> {
    const [created] = await this.db
      .insert(clientAccountStatements)
      .values(data)
      .returning();
    return created;
  }

  async updateStatement(
    id: string,
    data: Partial<typeof clientAccountStatements.$inferInsert>,
  ): Promise<AccountStatementRecord> {
    const [updated] = await this.db
      .update(clientAccountStatements)
      .set(data)
      .where(eq(clientAccountStatements.id, id))
      .returning();
    return updated;
  }

  async findFundsByClient(
    organizationId: string,
    clientId: string,
  ): Promise<ClientFundsRecord | undefined> {
    const [row] = await this.db
      .select()
      .from(clientFunds)
      .where(
        and(
          eq(clientFunds.organizationId, organizationId),
          eq(clientFunds.clientId, clientId),
        ),
      );
    return row;
  }

  async upsertClientFunds(
    organizationId: string,
    clientId: string,
    availableBalance: string,
    currency: string,
  ): Promise<ClientFundsRecord> {
    const existing = await this.findFundsByClient(organizationId, clientId);

    if (existing) {
      const [updated] = await this.db
        .update(clientFunds)
        .set({ availableBalance, lastMovementAt: new Date() })
        .where(eq(clientFunds.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await this.db
      .insert(clientFunds)
      .values({
        organizationId,
        clientId,
        availableBalance,
        currency,
        lastMovementAt: new Date(),
      })
      .returning();
    return created;
  }

  async getClientBalancesBulk(
    organizationId: string,
  ): Promise<{ clientId: string; balance: string }[]> {
    return this.db
      .select({
        clientId: clientAccountMovements.clientId,
        balance: sql<string>`COALESCE(SUM(${clientAccountMovements.amount}), '0')`,
      })
      .from(clientAccountMovements)
      .where(eq(clientAccountMovements.organizationId, organizationId))
      .groupBy(clientAccountMovements.clientId);
  }

  async findAllFunds(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ funds: ClientFundsRecord[]; total: number }> {
    const where = eq(clientFunds.organizationId, organizationId);

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(clientFunds)
        .where(where)
        .orderBy(desc(clientFunds.availableBalance))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(clientFunds)
        .where(where),
    ]);

    return { funds: rows, total: countResult[0].count };
  }
}
