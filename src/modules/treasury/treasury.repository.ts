import { Inject, Injectable } from '@nestjs/common';
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  bankAccounts,
  fundMovements,
  clientBalances,
} from '../../database/schema/index.js';

export type BankAccountRecord = typeof bankAccounts.$inferSelect;
export type FundMovementRecord = typeof fundMovements.$inferSelect;
export type ClientBalanceRecord = typeof clientBalances.$inferSelect;

@Injectable()
export class TreasuryRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  // --- Bank Accounts ---

  async findBankAccountsByOrganization(
    organizationId: string,
  ): Promise<BankAccountRecord[]> {
    return this.db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.organizationId, organizationId))
      .orderBy(bankAccounts.bankName);
  }

  async findBankAccountByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<BankAccountRecord | undefined> {
    const result = await this.db
      .select()
      .from(bankAccounts)
      .where(
        and(
          eq(bankAccounts.id, id),
          eq(bankAccounts.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async insertBankAccount(
    data: typeof bankAccounts.$inferInsert,
  ): Promise<BankAccountRecord> {
    const [created] = await this.db
      .insert(bankAccounts)
      .values(data)
      .returning();

    return created;
  }

  async updateBankAccount(
    id: string,
    data: Partial<typeof bankAccounts.$inferInsert>,
  ): Promise<BankAccountRecord> {
    const [updated] = await this.db
      .update(bankAccounts)
      .set(data)
      .where(eq(bankAccounts.id, id))
      .returning();

    return updated;
  }

  async deleteBankAccount(id: string): Promise<void> {
    await this.db.delete(bankAccounts).where(eq(bankAccounts.id, id));
  }

  // --- Fund Movements ---

  async findMovementsByOrganization(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ movements: FundMovementRecord[]; total: number }> {
    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(fundMovements)
        .where(eq(fundMovements.organizationId, organizationId))
        .orderBy(desc(fundMovements.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(fundMovements)
        .where(eq(fundMovements.organizationId, organizationId)),
    ]);

    return { movements: rows, total: countResult[0].count };
  }

  async findMovementByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<FundMovementRecord | undefined> {
    const result = await this.db
      .select()
      .from(fundMovements)
      .where(
        and(
          eq(fundMovements.id, id),
          eq(fundMovements.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async insertMovement(
    data: typeof fundMovements.$inferInsert,
  ): Promise<FundMovementRecord> {
    const [created] = await this.db
      .insert(fundMovements)
      .values(data)
      .returning();

    return created;
  }

  async updateMovement(
    id: string,
    data: Partial<typeof fundMovements.$inferInsert>,
  ): Promise<FundMovementRecord> {
    const [updated] = await this.db
      .update(fundMovements)
      .set(data)
      .where(eq(fundMovements.id, id))
      .returning();

    return updated;
  }

  async searchMovements(
    organizationId: string,
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ movements: FundMovementRecord[]; total: number }> {
    const pattern = `%${query}%`;

    const whereClause = and(
      eq(fundMovements.organizationId, organizationId),
      or(
        ilike(fundMovements.referenceNumber, pattern),
        ilike(fundMovements.description, pattern),
      ),
    );

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(fundMovements)
        .where(whereClause)
        .orderBy(desc(fundMovements.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(fundMovements)
        .where(whereClause),
    ]);

    return { movements: rows, total: countResult[0].count };
  }

  async findMovementsByBankAccount(
    bankAccountId: string,
    limit: number,
    offset: number,
  ): Promise<{ movements: FundMovementRecord[]; total: number }> {
    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(fundMovements)
        .where(eq(fundMovements.bankAccountId, bankAccountId))
        .orderBy(desc(fundMovements.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(fundMovements)
        .where(eq(fundMovements.bankAccountId, bankAccountId)),
    ]);

    return { movements: rows, total: countResult[0].count };
  }

  // --- Client Balances ---

  async findClientBalancesByOrganization(
    organizationId: string,
  ): Promise<ClientBalanceRecord[]> {
    return this.db
      .select()
      .from(clientBalances)
      .where(eq(clientBalances.organizationId, organizationId));
  }

  async findClientBalance(
    organizationId: string,
    clientId: string,
    currency: string,
  ): Promise<ClientBalanceRecord | undefined> {
    const result = await this.db
      .select()
      .from(clientBalances)
      .where(
        and(
          eq(clientBalances.organizationId, organizationId),
          eq(clientBalances.clientId, clientId),
          eq(clientBalances.currency, currency),
        ),
      )
      .limit(1);

    return result[0];
  }

  async upsertClientBalance(
    organizationId: string,
    clientId: string,
    currency: string,
    totalAdvances: string,
    totalCharges: string,
    currentBalance: string,
  ): Promise<ClientBalanceRecord> {
    const existing = await this.findClientBalance(
      organizationId,
      clientId,
      currency,
    );

    if (existing) {
      const [updated] = await this.db
        .update(clientBalances)
        .set({ totalAdvances, totalCharges, currentBalance })
        .where(eq(clientBalances.id, existing.id))
        .returning();

      return updated;
    }

    const [created] = await this.db
      .insert(clientBalances)
      .values({
        organizationId,
        clientId,
        currency,
        totalAdvances,
        totalCharges,
        currentBalance,
      })
      .returning();

    return created;
  }
}
