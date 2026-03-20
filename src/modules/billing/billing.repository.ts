import { Inject, Injectable } from '@nestjs/common';
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  invoices,
  invoiceItems,
  payments,
  expenseAccounts,
  expenseAccountItems,
} from '../../database/schema/index.js';

export type InvoiceRecord = typeof invoices.$inferSelect;
export type InvoiceItemRecord = typeof invoiceItems.$inferSelect;
export type PaymentRecord = typeof payments.$inferSelect;
export type ExpenseAccountRecord = typeof expenseAccounts.$inferSelect;
export type ExpenseAccountItemRecord = typeof expenseAccountItems.$inferSelect;

@Injectable()
export class BillingRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  // --- Invoices ---

  async findInvoicesByOrganization(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ invoices: InvoiceRecord[]; total: number }> {
    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(invoices)
        .where(eq(invoices.organizationId, organizationId))
        .orderBy(desc(invoices.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(invoices)
        .where(eq(invoices.organizationId, organizationId)),
    ]);

    return { invoices: rows, total: countResult[0].count };
  }

  async findInvoiceByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<InvoiceRecord | undefined> {
    const result = await this.db
      .select()
      .from(invoices)
      .where(
        and(eq(invoices.id, id), eq(invoices.organizationId, organizationId)),
      )
      .limit(1);

    return result[0];
  }

  async insertInvoice(
    data: typeof invoices.$inferInsert,
  ): Promise<InvoiceRecord> {
    const [created] = await this.db.insert(invoices).values(data).returning();

    return created;
  }

  async updateInvoice(
    id: string,
    data: Partial<typeof invoices.$inferInsert>,
  ): Promise<InvoiceRecord> {
    const [updated] = await this.db
      .update(invoices)
      .set(data)
      .where(eq(invoices.id, id))
      .returning();

    return updated;
  }

  async deleteInvoice(id: string): Promise<void> {
    await this.db.delete(invoices).where(eq(invoices.id, id));
  }

  async searchInvoices(
    organizationId: string,
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ invoices: InvoiceRecord[]; total: number }> {
    const pattern = `%${query}%`;

    const whereClause = and(
      eq(invoices.organizationId, organizationId),
      or(
        ilike(invoices.invoiceNumber, pattern),
        ilike(invoices.invoiceSeries, pattern),
        ilike(invoices.cfdiUuid, pattern),
      ),
    );

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(invoices)
        .where(whereClause)
        .orderBy(desc(invoices.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(invoices)
        .where(whereClause),
    ]);

    return { invoices: rows, total: countResult[0].count };
  }

  // --- Invoice Items ---

  async findItemsByInvoice(invoiceId: string): Promise<InvoiceItemRecord[]> {
    return this.db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId))
      .orderBy(invoiceItems.itemNumber);
  }

  async findInvoiceItemById(
    id: string,
  ): Promise<InvoiceItemRecord | undefined> {
    const result = await this.db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.id, id))
      .limit(1);

    return result[0];
  }

  async insertInvoiceItem(
    data: typeof invoiceItems.$inferInsert,
  ): Promise<InvoiceItemRecord> {
    const [created] = await this.db
      .insert(invoiceItems)
      .values(data)
      .returning();

    return created;
  }

  async updateInvoiceItem(
    id: string,
    data: Partial<typeof invoiceItems.$inferInsert>,
  ): Promise<InvoiceItemRecord> {
    const [updated] = await this.db
      .update(invoiceItems)
      .set(data)
      .where(eq(invoiceItems.id, id))
      .returning();

    return updated;
  }

  async deleteInvoiceItem(id: string): Promise<void> {
    await this.db.delete(invoiceItems).where(eq(invoiceItems.id, id));
  }

  // --- Payments ---

  async findPaymentsByInvoice(invoiceId: string): Promise<PaymentRecord[]> {
    return this.db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, invoiceId))
      .orderBy(desc(payments.createdAt));
  }

  async findPaymentsByOrganization(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ payments: PaymentRecord[]; total: number }> {
    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(payments)
        .where(eq(payments.organizationId, organizationId))
        .orderBy(desc(payments.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(payments)
        .where(eq(payments.organizationId, organizationId)),
    ]);

    return { payments: rows, total: countResult[0].count };
  }

  async findPaymentById(
    id: string,
    organizationId: string,
  ): Promise<PaymentRecord | undefined> {
    const result = await this.db
      .select()
      .from(payments)
      .where(
        and(eq(payments.id, id), eq(payments.organizationId, organizationId)),
      )
      .limit(1);

    return result[0];
  }

  async insertPayment(
    data: typeof payments.$inferInsert,
  ): Promise<PaymentRecord> {
    const [created] = await this.db.insert(payments).values(data).returning();

    return created;
  }

  async updatePayment(
    id: string,
    data: Partial<typeof payments.$inferInsert>,
  ): Promise<PaymentRecord> {
    const [updated] = await this.db
      .update(payments)
      .set(data)
      .where(eq(payments.id, id))
      .returning();

    return updated;
  }

  // --- Expense Accounts ---

  async findExpenseAccountsByOrganization(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ expenseAccounts: ExpenseAccountRecord[]; total: number }> {
    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(expenseAccounts)
        .where(eq(expenseAccounts.organizationId, organizationId))
        .orderBy(desc(expenseAccounts.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(expenseAccounts)
        .where(eq(expenseAccounts.organizationId, organizationId)),
    ]);

    return { expenseAccounts: rows, total: countResult[0].count };
  }

  async findExpenseAccountByIdAndOrg(
    id: string,
    organizationId: string,
  ): Promise<ExpenseAccountRecord | undefined> {
    const result = await this.db
      .select()
      .from(expenseAccounts)
      .where(
        and(
          eq(expenseAccounts.id, id),
          eq(expenseAccounts.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async insertExpenseAccount(
    data: typeof expenseAccounts.$inferInsert,
  ): Promise<ExpenseAccountRecord> {
    const [created] = await this.db
      .insert(expenseAccounts)
      .values(data)
      .returning();

    return created;
  }

  async updateExpenseAccount(
    id: string,
    data: Partial<typeof expenseAccounts.$inferInsert>,
  ): Promise<ExpenseAccountRecord> {
    const [updated] = await this.db
      .update(expenseAccounts)
      .set(data)
      .where(eq(expenseAccounts.id, id))
      .returning();

    return updated;
  }

  async deleteExpenseAccount(id: string): Promise<void> {
    await this.db.delete(expenseAccounts).where(eq(expenseAccounts.id, id));
  }

  async searchExpenseAccounts(
    organizationId: string,
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ expenseAccounts: ExpenseAccountRecord[]; total: number }> {
    const pattern = `%${query}%`;

    const whereClause = and(
      eq(expenseAccounts.organizationId, organizationId),
      or(ilike(expenseAccounts.accountNumber, pattern)),
    );

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(expenseAccounts)
        .where(whereClause)
        .orderBy(desc(expenseAccounts.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(expenseAccounts)
        .where(whereClause),
    ]);

    return { expenseAccounts: rows, total: countResult[0].count };
  }

  // --- Expense Account Items ---

  async findItemsByExpenseAccount(
    expenseAccountId: string,
  ): Promise<ExpenseAccountItemRecord[]> {
    return this.db
      .select()
      .from(expenseAccountItems)
      .where(eq(expenseAccountItems.expenseAccountId, expenseAccountId))
      .orderBy(expenseAccountItems.itemNumber);
  }

  async findExpenseAccountItemById(
    id: string,
  ): Promise<ExpenseAccountItemRecord | undefined> {
    const result = await this.db
      .select()
      .from(expenseAccountItems)
      .where(eq(expenseAccountItems.id, id))
      .limit(1);

    return result[0];
  }

  async insertExpenseAccountItem(
    data: typeof expenseAccountItems.$inferInsert,
  ): Promise<ExpenseAccountItemRecord> {
    const [created] = await this.db
      .insert(expenseAccountItems)
      .values(data)
      .returning();

    return created;
  }

  async updateExpenseAccountItem(
    id: string,
    data: Partial<typeof expenseAccountItems.$inferInsert>,
  ): Promise<ExpenseAccountItemRecord> {
    const [updated] = await this.db
      .update(expenseAccountItems)
      .set(data)
      .where(eq(expenseAccountItems.id, id))
      .returning();

    return updated;
  }

  async deleteExpenseAccountItem(id: string): Promise<void> {
    await this.db
      .delete(expenseAccountItems)
      .where(eq(expenseAccountItems.id, id));
  }
}
