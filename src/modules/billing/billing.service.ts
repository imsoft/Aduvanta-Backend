import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  BillingRepository,
  type InvoiceRecord,
  type InvoiceItemRecord,
  type PaymentRecord,
  type ExpenseAccountRecord,
  type ExpenseAccountItemRecord,
} from './billing.repository.js';
import type { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import type { UpdateInvoiceDto } from './dto/update-invoice.dto.js';
import type { AddInvoiceItemDto } from './dto/add-invoice-item.dto.js';
import type { CreatePaymentDto } from './dto/create-payment.dto.js';
import type { CreateExpenseAccountDto } from './dto/create-expense-account.dto.js';
import type { UpdateExpenseAccountDto } from './dto/update-expense-account.dto.js';
import type { AddExpenseAccountItemDto } from './dto/add-expense-account-item.dto.js';
import type { ChangeExpenseAccountStatusDto } from './dto/change-expense-account-status.dto.js';

const INVOICE_EDITABLE_STATUSES = new Set(['DRAFT']);

const EXPENSE_ACCOUNT_EDITABLE_STATUSES = new Set(['DRAFT']);

const EXPENSE_ACCOUNT_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['GENERATED'],
  GENERATED: ['SENT_TO_CLIENT', 'DRAFT'],
  SENT_TO_CLIENT: ['APPROVED_BY_CLIENT', 'DRAFT'],
  APPROVED_BY_CLIENT: ['INVOICED'],
  INVOICED: ['CLOSED'],
  CLOSED: [],
};

@Injectable()
export class BillingService {
  constructor(
    private readonly repository: BillingRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  // ========== Invoices ==========

  async listInvoices(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ invoices: InvoiceRecord[]; total: number }> {
    return this.repository.findInvoicesByOrganization(
      organizationId,
      limit,
      offset,
    );
  }

  async searchInvoices(
    organizationId: string,
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ invoices: InvoiceRecord[]; total: number }> {
    return this.repository.searchInvoices(organizationId, query, limit, offset);
  }

  async getInvoiceById(
    id: string,
    organizationId: string,
  ): Promise<InvoiceRecord> {
    const invoice = await this.repository.findInvoiceByIdAndOrg(
      id,
      organizationId,
    );

    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }

    return invoice;
  }

  async getInvoiceDetails(id: string, organizationId: string) {
    const invoice = await this.getInvoiceById(id, organizationId);
    const [items, invoicePayments] = await Promise.all([
      this.repository.findItemsByInvoice(id),
      this.repository.findPaymentsByInvoice(id),
    ]);

    return { ...invoice, items, payments: invoicePayments };
  }

  async createInvoice(
    dto: CreateInvoiceDto,
    actorId: string,
    organizationId: string,
  ): Promise<InvoiceRecord> {
    const invoice = await this.repository.insertInvoice({
      organizationId,
      clientId: dto.clientId,
      type: dto.type as 'SERVICE',
      invoiceNumber: dto.invoiceNumber,
      invoiceSeries: dto.invoiceSeries,
      issueDate: dto.issueDate,
      dueDate: dto.dueDate,
      currency: dto.currency ?? 'MXN',
      exchangeRate: dto.exchangeRate,
      subtotal: '0',
      taxAmount: '0',
      totalAmount: '0',
      balanceDue: '0',
      cfdiUsage: dto.cfdiUsage,
      paymentMethod: dto.paymentMethod,
      paymentForm: dto.paymentForm,
      shipmentId: dto.shipmentId,
      entryId: dto.entryId,
      observations: dto.observations,
      createdById: actorId,
      status: 'DRAFT',
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.INVOICE_CREATED,
      resource: 'invoice',
      resourceId: invoice.id,
      metadata: {
        type: invoice.type,
        clientId: invoice.clientId,
      },
    });

    return invoice;
  }

  async updateInvoice(
    id: string,
    dto: UpdateInvoiceDto,
    actorId: string,
    organizationId: string,
  ): Promise<InvoiceRecord> {
    const existing = await this.getInvoiceById(id, organizationId);

    if (!INVOICE_EDITABLE_STATUSES.has(existing.status)) {
      throw new BadRequestException(
        `Cannot edit invoice in status ${existing.status}`,
      );
    }

    const updated = await this.repository.updateInvoice(id, {
      ...dto,
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.INVOICE_UPDATED,
      resource: 'invoice',
      resourceId: id,
      metadata: { ...dto },
    });

    return updated;
  }

  async deleteInvoice(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const invoice = await this.getInvoiceById(id, organizationId);

    if (!INVOICE_EDITABLE_STATUSES.has(invoice.status)) {
      throw new BadRequestException(
        `Cannot delete invoice in status ${invoice.status}`,
      );
    }

    await this.repository.deleteInvoice(id);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.INVOICE_DELETED,
      resource: 'invoice',
      resourceId: id,
      metadata: { invoiceNumber: invoice.invoiceNumber },
    });
  }

  async issueInvoice(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<InvoiceRecord> {
    const invoice = await this.getInvoiceById(id, organizationId);

    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException(
        `Cannot issue invoice in status ${invoice.status}`,
      );
    }

    const updated = await this.repository.updateInvoice(id, {
      status: 'ISSUED',
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.INVOICE_ISSUED,
      resource: 'invoice',
      resourceId: id,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
      },
    });

    return updated;
  }

  async cancelInvoice(
    id: string,
    reason: string,
    actorId: string,
    organizationId: string,
  ): Promise<InvoiceRecord> {
    const invoice = await this.getInvoiceById(id, organizationId);

    if (invoice.status === 'CANCELLED' || invoice.status === 'CREDITED') {
      throw new BadRequestException(
        `Invoice is already ${invoice.status.toLowerCase()}`,
      );
    }

    const updated = await this.repository.updateInvoice(id, {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancellationReason: reason,
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.INVOICE_CANCELLED,
      resource: 'invoice',
      resourceId: id,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        reason,
      },
    });

    return updated;
  }

  // --- Invoice Items ---

  async listInvoiceItems(
    invoiceId: string,
    organizationId: string,
  ): Promise<InvoiceItemRecord[]> {
    await this.getInvoiceById(invoiceId, organizationId);
    return this.repository.findItemsByInvoice(invoiceId);
  }

  async addInvoiceItem(
    invoiceId: string,
    dto: AddInvoiceItemDto,
    actorId: string,
    organizationId: string,
  ): Promise<InvoiceItemRecord> {
    const invoice = await this.getInvoiceById(invoiceId, organizationId);

    if (!INVOICE_EDITABLE_STATUSES.has(invoice.status)) {
      throw new BadRequestException(
        `Cannot add items to invoice in status ${invoice.status}`,
      );
    }

    const item = await this.repository.insertInvoiceItem({
      invoiceId,
      itemNumber: dto.itemNumber,
      category: dto.category as 'SERVICE_FEE',
      satProductCode: dto.satProductCode,
      description: dto.description,
      measurementUnit: dto.measurementUnit ?? 'E48',
      quantity: dto.quantity ?? '1',
      unitPrice: dto.unitPrice,
      subtotal: dto.subtotal,
      taxRate: dto.taxRate,
      taxAmount: dto.taxAmount,
      total: dto.total,
      operationChargeId: dto.operationChargeId,
      observations: dto.observations,
    });

    // Recalculate invoice totals
    await this.recalculateInvoiceTotals(invoiceId, actorId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.INVOICE_ITEM_ADDED,
      resource: 'invoice_item',
      resourceId: item.id,
      metadata: {
        invoiceId,
        category: item.category,
        total: item.total,
      },
    });

    return item;
  }

  async removeInvoiceItem(
    invoiceId: string,
    itemId: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const invoice = await this.getInvoiceById(invoiceId, organizationId);

    if (!INVOICE_EDITABLE_STATUSES.has(invoice.status)) {
      throw new BadRequestException(
        `Cannot remove items from invoice in status ${invoice.status}`,
      );
    }

    const existing = await this.repository.findInvoiceItemById(itemId);
    if (!existing || existing.invoiceId !== invoiceId) {
      throw new NotFoundException(`Item ${itemId} not found in invoice`);
    }

    await this.repository.deleteInvoiceItem(itemId);
    await this.recalculateInvoiceTotals(invoiceId, actorId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.INVOICE_ITEM_REMOVED,
      resource: 'invoice_item',
      resourceId: itemId,
      metadata: { invoiceId, description: existing.description },
    });
  }

  private async recalculateInvoiceTotals(
    invoiceId: string,
    actorId: string,
  ): Promise<void> {
    const items = await this.repository.findItemsByInvoice(invoiceId);

    let subtotal = 0;
    let taxAmount = 0;

    for (const item of items) {
      subtotal += parseFloat(item.subtotal);
      taxAmount += parseFloat(item.taxAmount ?? '0');
    }

    const totalAmount = subtotal + taxAmount;

    await this.repository.updateInvoice(invoiceId, {
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      balanceDue: totalAmount.toFixed(2),
      totalItems: items.length,
      updatedById: actorId,
    });
  }

  // ========== Payments ==========

  async listPayments(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ payments: PaymentRecord[]; total: number }> {
    return this.repository.findPaymentsByOrganization(
      organizationId,
      limit,
      offset,
    );
  }

  async listPaymentsByInvoice(
    invoiceId: string,
    organizationId: string,
  ): Promise<PaymentRecord[]> {
    await this.getInvoiceById(invoiceId, organizationId);
    return this.repository.findPaymentsByInvoice(invoiceId);
  }

  async createPayment(
    dto: CreatePaymentDto,
    actorId: string,
    organizationId: string,
  ): Promise<PaymentRecord> {
    const invoice = await this.getInvoiceById(dto.invoiceId, organizationId);

    if (invoice.status === 'CANCELLED' || invoice.status === 'CREDITED') {
      throw new BadRequestException(
        `Cannot create payment for ${invoice.status.toLowerCase()} invoice`,
      );
    }

    const payment = await this.repository.insertPayment({
      organizationId,
      invoiceId: dto.invoiceId,
      method: dto.method as 'BANK_TRANSFER',
      amount: dto.amount,
      currency: dto.currency ?? 'MXN',
      exchangeRate: dto.exchangeRate,
      reference: dto.reference,
      bankName: dto.bankName,
      accountNumber: dto.accountNumber,
      paymentDate: dto.paymentDate,
      notes: dto.notes,
      createdById: actorId,
      status: 'PENDING',
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.PAYMENT_CREATED,
      resource: 'payment',
      resourceId: payment.id,
      metadata: {
        invoiceId: dto.invoiceId,
        amount: dto.amount,
        method: dto.method,
      },
    });

    return payment;
  }

  async confirmPayment(
    paymentId: string,
    actorId: string,
    organizationId: string,
  ): Promise<PaymentRecord> {
    const payment = await this.repository.findPaymentById(
      paymentId,
      organizationId,
    );

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot confirm payment in status ${payment.status}`,
      );
    }

    const confirmed = await this.repository.updatePayment(paymentId, {
      status: 'CONFIRMED',
      confirmedAt: new Date(),
    });

    // Update invoice paid amount and status
    await this.updateInvoicePaymentStatus(payment.invoiceId, organizationId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.PAYMENT_CONFIRMED,
      resource: 'payment',
      resourceId: paymentId,
      metadata: {
        invoiceId: payment.invoiceId,
        amount: payment.amount,
      },
    });

    return confirmed;
  }

  async cancelPayment(
    paymentId: string,
    actorId: string,
    organizationId: string,
  ): Promise<PaymentRecord> {
    const payment = await this.repository.findPaymentById(
      paymentId,
      organizationId,
    );

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    if (payment.status === 'CANCELLED') {
      throw new BadRequestException('Payment is already cancelled');
    }

    const cancelled = await this.repository.updatePayment(paymentId, {
      status: 'CANCELLED',
    });

    if (payment.status === 'CONFIRMED') {
      await this.updateInvoicePaymentStatus(payment.invoiceId, organizationId);
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.PAYMENT_CANCELLED,
      resource: 'payment',
      resourceId: paymentId,
      metadata: { invoiceId: payment.invoiceId },
    });

    return cancelled;
  }

  private async updateInvoicePaymentStatus(
    invoiceId: string,
    organizationId: string,
  ): Promise<void> {
    const invoice = await this.repository.findInvoiceByIdAndOrg(
      invoiceId,
      organizationId,
    );
    if (!invoice) return;

    const invoicePayments =
      await this.repository.findPaymentsByInvoice(invoiceId);

    let paidAmount = 0;
    for (const p of invoicePayments) {
      if (p.status === 'CONFIRMED') {
        paidAmount += parseFloat(p.amount);
      }
    }

    const totalAmount = parseFloat(invoice.totalAmount);
    const balanceDue = totalAmount - paidAmount;

    let status: string = invoice.status;
    if (paidAmount >= totalAmount && totalAmount > 0) {
      status = 'PAID';
    } else if (paidAmount > 0) {
      status = 'PARTIALLY_PAID';
    } else if (
      invoice.status === 'PAID' ||
      invoice.status === 'PARTIALLY_PAID'
    ) {
      status = 'ISSUED';
    }

    await this.repository.updateInvoice(invoiceId, {
      paidAmount: paidAmount.toFixed(2),
      balanceDue: balanceDue.toFixed(2),
      status: status as 'DRAFT',
    });
  }

  // ========== Expense Accounts ==========

  async listExpenseAccounts(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ expenseAccounts: ExpenseAccountRecord[]; total: number }> {
    return this.repository.findExpenseAccountsByOrganization(
      organizationId,
      limit,
      offset,
    );
  }

  async searchExpenseAccounts(
    organizationId: string,
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ expenseAccounts: ExpenseAccountRecord[]; total: number }> {
    return this.repository.searchExpenseAccounts(
      organizationId,
      query,
      limit,
      offset,
    );
  }

  async getExpenseAccountById(
    id: string,
    organizationId: string,
  ): Promise<ExpenseAccountRecord> {
    const account = await this.repository.findExpenseAccountByIdAndOrg(
      id,
      organizationId,
    );

    if (!account) {
      throw new NotFoundException(`Expense account ${id} not found`);
    }

    return account;
  }

  async getExpenseAccountDetails(id: string, organizationId: string) {
    const account = await this.getExpenseAccountById(id, organizationId);
    const items = await this.repository.findItemsByExpenseAccount(id);
    return { ...account, items };
  }

  async createExpenseAccount(
    dto: CreateExpenseAccountDto,
    actorId: string,
    organizationId: string,
  ): Promise<ExpenseAccountRecord> {
    const account = await this.repository.insertExpenseAccount({
      organizationId,
      clientId: dto.clientId,
      accountNumber: dto.accountNumber,
      shipmentId: dto.shipmentId,
      entryId: dto.entryId,
      periodFrom: dto.periodFrom,
      periodTo: dto.periodTo,
      currency: dto.currency ?? 'MXN',
      totalCharges: '0',
      totalAdvances: '0',
      balanceDue: '0',
      observations: dto.observations,
      createdById: actorId,
      status: 'DRAFT',
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.EXPENSE_ACCOUNT_CREATED,
      resource: 'expense_account',
      resourceId: account.id,
      metadata: {
        clientId: dto.clientId,
        accountNumber: account.accountNumber,
      },
    });

    return account;
  }

  async updateExpenseAccount(
    id: string,
    dto: UpdateExpenseAccountDto,
    actorId: string,
    organizationId: string,
  ): Promise<ExpenseAccountRecord> {
    const existing = await this.getExpenseAccountById(id, organizationId);

    if (!EXPENSE_ACCOUNT_EDITABLE_STATUSES.has(existing.status)) {
      throw new BadRequestException(
        `Cannot edit expense account in status ${existing.status}`,
      );
    }

    const updated = await this.repository.updateExpenseAccount(id, {
      ...dto,
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.EXPENSE_ACCOUNT_UPDATED,
      resource: 'expense_account',
      resourceId: id,
      metadata: { ...dto },
    });

    return updated;
  }

  async deleteExpenseAccount(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const account = await this.getExpenseAccountById(id, organizationId);

    if (!EXPENSE_ACCOUNT_EDITABLE_STATUSES.has(account.status)) {
      throw new BadRequestException(
        `Cannot delete expense account in status ${account.status}`,
      );
    }

    await this.repository.deleteExpenseAccount(id);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.EXPENSE_ACCOUNT_DELETED,
      resource: 'expense_account',
      resourceId: id,
      metadata: { accountNumber: account.accountNumber },
    });
  }

  async changeExpenseAccountStatus(
    id: string,
    dto: ChangeExpenseAccountStatusDto,
    actorId: string,
    organizationId: string,
  ): Promise<ExpenseAccountRecord> {
    const account = await this.getExpenseAccountById(id, organizationId);

    const allowedTransitions = EXPENSE_ACCOUNT_TRANSITIONS[account.status];
    if (!allowedTransitions || !allowedTransitions.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${account.status} to ${dto.status}`,
      );
    }

    const updated = await this.repository.updateExpenseAccount(id, {
      status: dto.status as 'DRAFT',
      generatedDate:
        dto.status === 'GENERATED'
          ? new Date().toISOString().split('T')[0]
          : undefined,
      updatedById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.EXPENSE_ACCOUNT_STATUS_CHANGED,
      resource: 'expense_account',
      resourceId: id,
      metadata: {
        previousStatus: account.status,
        newStatus: dto.status,
      },
    });

    return updated;
  }

  // --- Expense Account Items ---

  async listExpenseAccountItems(
    expenseAccountId: string,
    organizationId: string,
  ): Promise<ExpenseAccountItemRecord[]> {
    await this.getExpenseAccountById(expenseAccountId, organizationId);
    return this.repository.findItemsByExpenseAccount(expenseAccountId);
  }

  async addExpenseAccountItem(
    expenseAccountId: string,
    dto: AddExpenseAccountItemDto,
    actorId: string,
    organizationId: string,
  ): Promise<ExpenseAccountItemRecord> {
    const account = await this.getExpenseAccountById(
      expenseAccountId,
      organizationId,
    );

    if (!EXPENSE_ACCOUNT_EDITABLE_STATUSES.has(account.status)) {
      throw new BadRequestException(
        `Cannot add items to expense account in status ${account.status}`,
      );
    }

    const item = await this.repository.insertExpenseAccountItem({
      expenseAccountId,
      itemNumber: dto.itemNumber,
      category: dto.category,
      description: dto.description,
      receiptNumber: dto.receiptNumber,
      receiptDate: dto.receiptDate,
      amount: dto.amount,
      currency: dto.currency ?? 'MXN',
      exchangeRate: dto.exchangeRate,
      amountMxn: dto.amountMxn,
      taxAmount: dto.taxAmount,
      operationChargeId: dto.operationChargeId,
      observations: dto.observations,
    });

    await this.recalculateExpenseAccountTotals(expenseAccountId, actorId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.EXPENSE_ACCOUNT_ITEM_ADDED,
      resource: 'expense_account_item',
      resourceId: item.id,
      metadata: {
        expenseAccountId,
        category: item.category,
        amountMxn: item.amountMxn,
      },
    });

    return item;
  }

  async removeExpenseAccountItem(
    expenseAccountId: string,
    itemId: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const account = await this.getExpenseAccountById(
      expenseAccountId,
      organizationId,
    );

    if (!EXPENSE_ACCOUNT_EDITABLE_STATUSES.has(account.status)) {
      throw new BadRequestException(
        `Cannot remove items from expense account in status ${account.status}`,
      );
    }

    const existing = await this.repository.findExpenseAccountItemById(itemId);
    if (!existing || existing.expenseAccountId !== expenseAccountId) {
      throw new NotFoundException(
        `Item ${itemId} not found in expense account`,
      );
    }

    await this.repository.deleteExpenseAccountItem(itemId);
    await this.recalculateExpenseAccountTotals(expenseAccountId, actorId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.EXPENSE_ACCOUNT_ITEM_REMOVED,
      resource: 'expense_account_item',
      resourceId: itemId,
      metadata: {
        expenseAccountId,
        description: existing.description,
      },
    });
  }

  private async recalculateExpenseAccountTotals(
    expenseAccountId: string,
    actorId: string,
  ): Promise<void> {
    const items =
      await this.repository.findItemsByExpenseAccount(expenseAccountId);

    let totalCharges = 0;
    for (const item of items) {
      totalCharges += parseFloat(item.amountMxn);
    }

    await this.repository.updateExpenseAccount(expenseAccountId, {
      totalCharges: totalCharges.toFixed(2),
      balanceDue: totalCharges.toFixed(2),
      updatedById: actorId,
    });
  }
}
