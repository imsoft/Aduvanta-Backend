import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { BillingService } from './billing.service.js';
import { BillingRepository } from './billing.repository.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';

const mockRepository = {
  findInvoicesByOrganization: jest.fn(),
  searchInvoices: jest.fn(),
  findInvoiceByIdAndOrg: jest.fn(),
  insertInvoice: jest.fn(),
  updateInvoice: jest.fn(),
  deleteInvoice: jest.fn(),
  findItemsByInvoice: jest.fn(),
  findInvoiceItemById: jest.fn(),
  insertInvoiceItem: jest.fn(),
  deleteInvoiceItem: jest.fn(),
  findPaymentsByOrganization: jest.fn(),
  findPaymentsByInvoice: jest.fn(),
  findPaymentById: jest.fn(),
  insertPayment: jest.fn(),
  updatePayment: jest.fn(),
  findExpenseAccountsByOrganization: jest.fn(),
  searchExpenseAccounts: jest.fn(),
  findExpenseAccountByIdAndOrg: jest.fn(),
  insertExpenseAccount: jest.fn(),
  updateExpenseAccount: jest.fn(),
  deleteExpenseAccount: jest.fn(),
  findItemsByExpenseAccount: jest.fn(),
  findExpenseAccountItemById: jest.fn(),
  insertExpenseAccountItem: jest.fn(),
  deleteExpenseAccountItem: jest.fn(),
};

const mockAuditLogsService = {
  log: jest.fn().mockResolvedValue(undefined),
};

const ORG_ID = 'org-1';
const ACTOR_ID = 'user-1';

function makeInvoice(overrides: Record<string, unknown> = {}) {
  return {
    id: 'inv-1',
    organizationId: ORG_ID,
    clientId: 'client-1',
    type: 'SERVICE',
    invoiceNumber: 'INV-001',
    invoiceSeries: 'A',
    status: 'DRAFT',
    subtotal: '0',
    taxAmount: '0',
    totalAmount: '0',
    balanceDue: '0',
    paidAmount: '0',
    createdById: ACTOR_ID,
    createdAt: new Date(),
    ...overrides,
  };
}

function makePayment(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pay-1',
    organizationId: ORG_ID,
    invoiceId: 'inv-1',
    method: 'BANK_TRANSFER',
    amount: '500.00',
    currency: 'MXN',
    status: 'PENDING',
    createdById: ACTOR_ID,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('BillingService', () => {
  let service: BillingService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: BillingRepository, useValue: mockRepository },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    }).compile();

    service = module.get(BillingService);
  });

  // --- createInvoice ---

  describe('createInvoice', () => {
    it('should create a DRAFT invoice with zeroed totals', async () => {
      const created = makeInvoice();
      mockRepository.insertInvoice.mockResolvedValue(created);

      const dto = {
        clientId: 'client-1',
        type: 'SERVICE',
        invoiceNumber: 'INV-001',
        invoiceSeries: 'A',
        issueDate: '2026-01-01',
        dueDate: '2026-02-01',
      };

      const result = await service.createInvoice(dto as any, ACTOR_ID, ORG_ID);

      expect(result).toEqual(created);
      expect(mockRepository.insertInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'DRAFT',
          subtotal: '0',
          taxAmount: '0',
          totalAmount: '0',
          balanceDue: '0',
        }),
      );
      expect(mockAuditLogsService.log).toHaveBeenCalled();
    });
  });

  // --- issueInvoice / cancelInvoice ---

  describe('issueInvoice', () => {
    it('should issue a DRAFT invoice', async () => {
      const invoice = makeInvoice({ status: 'DRAFT' });
      const issued = makeInvoice({ status: 'ISSUED' });

      mockRepository.findInvoiceByIdAndOrg.mockResolvedValue(invoice);
      mockRepository.updateInvoice.mockResolvedValue(issued);

      const result = await service.issueInvoice('inv-1', ACTOR_ID, ORG_ID);
      expect(result.status).toBe('ISSUED');
    });

    it('should reject issuing a non-DRAFT invoice', async () => {
      mockRepository.findInvoiceByIdAndOrg.mockResolvedValue(
        makeInvoice({ status: 'ISSUED' }),
      );

      await expect(
        service.issueInvoice('inv-1', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelInvoice', () => {
    it('should cancel an ISSUED invoice', async () => {
      const invoice = makeInvoice({ status: 'ISSUED' });
      const cancelled = makeInvoice({ status: 'CANCELLED' });

      mockRepository.findInvoiceByIdAndOrg.mockResolvedValue(invoice);
      mockRepository.updateInvoice.mockResolvedValue(cancelled);

      const result = await service.cancelInvoice(
        'inv-1',
        'Duplicate',
        ACTOR_ID,
        ORG_ID,
      );
      expect(result.status).toBe('CANCELLED');
    });

    it('should reject cancelling an already cancelled invoice', async () => {
      mockRepository.findInvoiceByIdAndOrg.mockResolvedValue(
        makeInvoice({ status: 'CANCELLED' }),
      );

      await expect(
        service.cancelInvoice('inv-1', 'reason', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject cancelling a CREDITED invoice', async () => {
      mockRepository.findInvoiceByIdAndOrg.mockResolvedValue(
        makeInvoice({ status: 'CREDITED' }),
      );

      await expect(
        service.cancelInvoice('inv-1', 'reason', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // --- addInvoiceItem / recalculation ---

  describe('addInvoiceItem', () => {
    it('should add item and recalculate totals', async () => {
      const invoice = makeInvoice({ status: 'DRAFT' });
      const item = {
        id: 'item-1',
        invoiceId: 'inv-1',
        itemNumber: 1,
        category: 'SERVICE_FEE',
        subtotal: '100.00',
        taxAmount: '16.00',
        total: '116.00',
      };

      mockRepository.findInvoiceByIdAndOrg.mockResolvedValue(invoice);
      mockRepository.insertInvoiceItem.mockResolvedValue(item);
      // After insert, recalculate fetches items
      mockRepository.findItemsByInvoice.mockResolvedValue([item]);
      mockRepository.updateInvoice.mockResolvedValue(invoice);

      const result = await service.addInvoiceItem(
        'inv-1',
        {
          itemNumber: 1,
          category: 'SERVICE_FEE',
          subtotal: '100.00',
          taxAmount: '16.00',
          total: '116.00',
          unitPrice: '100.00',
        } as any,
        ACTOR_ID,
        ORG_ID,
      );

      expect(result).toEqual(item);

      // Verify recalculation was triggered
      expect(mockRepository.updateInvoice).toHaveBeenCalledWith(
        'inv-1',
        expect.objectContaining({
          subtotal: '100.00',
          taxAmount: '16.00',
          totalAmount: '116.00',
          balanceDue: '116.00',
          totalItems: 1,
        }),
      );
    });

    it('should recalculate with multiple items', async () => {
      const invoice = makeInvoice({ status: 'DRAFT' });

      mockRepository.findInvoiceByIdAndOrg.mockResolvedValue(invoice);
      mockRepository.insertInvoiceItem.mockResolvedValue({ id: 'item-2' });
      mockRepository.findItemsByInvoice.mockResolvedValue([
        { subtotal: '100.00', taxAmount: '16.00' },
        { subtotal: '200.00', taxAmount: '32.00' },
      ]);
      mockRepository.updateInvoice.mockResolvedValue(invoice);

      await service.addInvoiceItem('inv-1', {} as any, ACTOR_ID, ORG_ID);

      expect(mockRepository.updateInvoice).toHaveBeenCalledWith(
        'inv-1',
        expect.objectContaining({
          subtotal: '300.00',
          taxAmount: '48.00',
          totalAmount: '348.00',
          balanceDue: '348.00',
          totalItems: 2,
        }),
      );
    });

    it('should reject adding items to non-DRAFT invoice', async () => {
      mockRepository.findInvoiceByIdAndOrg.mockResolvedValue(
        makeInvoice({ status: 'ISSUED' }),
      );

      await expect(
        service.addInvoiceItem('inv-1', {} as any, ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeInvoiceItem', () => {
    it('should remove item and recalculate totals', async () => {
      const invoice = makeInvoice({ status: 'DRAFT' });
      const item = { id: 'item-1', invoiceId: 'inv-1' };

      mockRepository.findInvoiceByIdAndOrg.mockResolvedValue(invoice);
      mockRepository.findInvoiceItemById.mockResolvedValue(item);
      mockRepository.deleteInvoiceItem.mockResolvedValue(undefined);
      mockRepository.findItemsByInvoice.mockResolvedValue([]);
      mockRepository.updateInvoice.mockResolvedValue(invoice);

      await service.removeInvoiceItem('inv-1', 'item-1', ACTOR_ID, ORG_ID);

      expect(mockRepository.deleteInvoiceItem).toHaveBeenCalledWith('item-1');
      expect(mockRepository.updateInvoice).toHaveBeenCalledWith(
        'inv-1',
        expect.objectContaining({
          subtotal: '0.00',
          taxAmount: '0.00',
          totalAmount: '0.00',
          totalItems: 0,
        }),
      );
    });

    it('should throw NotFoundException if item not found', async () => {
      mockRepository.findInvoiceByIdAndOrg.mockResolvedValue(
        makeInvoice({ status: 'DRAFT' }),
      );
      mockRepository.findInvoiceItemById.mockResolvedValue(undefined);

      await expect(
        service.removeInvoiceItem('inv-1', 'bad-id', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // --- Payments ---

  describe('createPayment', () => {
    it('should create a PENDING payment for an ISSUED invoice', async () => {
      const invoice = makeInvoice({ status: 'ISSUED' });
      const payment = makePayment();

      mockRepository.findInvoiceByIdAndOrg.mockResolvedValue(invoice);
      mockRepository.insertPayment.mockResolvedValue(payment);

      const dto = {
        invoiceId: 'inv-1',
        method: 'BANK_TRANSFER',
        amount: '500.00',
      };
      const result = await service.createPayment(dto as any, ACTOR_ID, ORG_ID);

      expect(result.status).toBe('PENDING');
    });

    it('should reject payment for cancelled invoice', async () => {
      mockRepository.findInvoiceByIdAndOrg.mockResolvedValue(
        makeInvoice({ status: 'CANCELLED' }),
      );

      await expect(
        service.createPayment({ invoiceId: 'inv-1' } as any, ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirmPayment', () => {
    it('should confirm a PENDING payment and update invoice balance', async () => {
      const payment = makePayment({ status: 'PENDING', amount: '500.00' });
      const confirmed = makePayment({ status: 'CONFIRMED' });
      const invoice = makeInvoice({ status: 'ISSUED', totalAmount: '1000.00' });

      mockRepository.findPaymentById.mockResolvedValue(payment);
      mockRepository.updatePayment.mockResolvedValue(confirmed);
      mockRepository.findInvoiceByIdAndOrg.mockResolvedValue(invoice);
      mockRepository.findPaymentsByInvoice.mockResolvedValue([
        { status: 'CONFIRMED', amount: '500.00' },
      ]);
      mockRepository.updateInvoice.mockResolvedValue(invoice);

      const result = await service.confirmPayment('pay-1', ACTOR_ID, ORG_ID);

      expect(result.status).toBe('CONFIRMED');
      expect(mockRepository.updateInvoice).toHaveBeenCalledWith(
        'inv-1',
        expect.objectContaining({
          paidAmount: '500.00',
          balanceDue: '500.00',
          status: 'PARTIALLY_PAID',
        }),
      );
    });

    it('should set invoice to PAID when fully paid', async () => {
      const payment = makePayment({ status: 'PENDING', amount: '1000.00' });
      const confirmed = makePayment({ status: 'CONFIRMED' });
      const invoice = makeInvoice({ status: 'ISSUED', totalAmount: '1000.00' });

      mockRepository.findPaymentById.mockResolvedValue(payment);
      mockRepository.updatePayment.mockResolvedValue(confirmed);
      mockRepository.findInvoiceByIdAndOrg.mockResolvedValue(invoice);
      mockRepository.findPaymentsByInvoice.mockResolvedValue([
        { status: 'CONFIRMED', amount: '1000.00' },
      ]);
      mockRepository.updateInvoice.mockResolvedValue(invoice);

      await service.confirmPayment('pay-1', ACTOR_ID, ORG_ID);

      expect(mockRepository.updateInvoice).toHaveBeenCalledWith(
        'inv-1',
        expect.objectContaining({
          paidAmount: '1000.00',
          balanceDue: '0.00',
          status: 'PAID',
        }),
      );
    });

    it('should reject confirming non-PENDING payment', async () => {
      mockRepository.findPaymentById.mockResolvedValue(
        makePayment({ status: 'CONFIRMED' }),
      );

      await expect(
        service.confirmPayment('pay-1', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelPayment', () => {
    it('should cancel a PENDING payment', async () => {
      const payment = makePayment({ status: 'PENDING' });
      const cancelled = makePayment({ status: 'CANCELLED' });

      mockRepository.findPaymentById.mockResolvedValue(payment);
      mockRepository.updatePayment.mockResolvedValue(cancelled);

      const result = await service.cancelPayment('pay-1', ACTOR_ID, ORG_ID);
      expect(result.status).toBe('CANCELLED');
    });

    it('should reverse balance when cancelling a CONFIRMED payment', async () => {
      const payment = makePayment({ status: 'CONFIRMED', amount: '500.00' });
      const cancelled = makePayment({ status: 'CANCELLED' });
      const invoice = makeInvoice({
        status: 'PARTIALLY_PAID',
        totalAmount: '1000.00',
      });

      mockRepository.findPaymentById.mockResolvedValue(payment);
      mockRepository.updatePayment.mockResolvedValue(cancelled);
      mockRepository.findInvoiceByIdAndOrg.mockResolvedValue(invoice);
      mockRepository.findPaymentsByInvoice.mockResolvedValue([]);
      mockRepository.updateInvoice.mockResolvedValue(invoice);

      await service.cancelPayment('pay-1', ACTOR_ID, ORG_ID);

      // updateInvoicePaymentStatus should be called since it was CONFIRMED
      expect(mockRepository.findPaymentsByInvoice).toHaveBeenCalledWith(
        'inv-1',
      );
      expect(mockRepository.updateInvoice).toHaveBeenCalledWith(
        'inv-1',
        expect.objectContaining({
          paidAmount: '0.00',
          balanceDue: '1000.00',
          status: 'ISSUED',
        }),
      );
    });

    it('should reject cancelling already cancelled payment', async () => {
      mockRepository.findPaymentById.mockResolvedValue(
        makePayment({ status: 'CANCELLED' }),
      );

      await expect(
        service.cancelPayment('pay-1', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // --- Expense Account Status Transitions ---

  describe('changeExpenseAccountStatus', () => {
    const validTransitions: [string, string][] = [
      ['DRAFT', 'GENERATED'],
      ['GENERATED', 'SENT_TO_CLIENT'],
      ['GENERATED', 'DRAFT'],
      ['SENT_TO_CLIENT', 'APPROVED_BY_CLIENT'],
      ['SENT_TO_CLIENT', 'DRAFT'],
      ['APPROVED_BY_CLIENT', 'INVOICED'],
      ['INVOICED', 'CLOSED'],
    ];

    it.each(validTransitions)(
      'should allow expense account transition from %s to %s',
      async (from, to) => {
        const account = { id: 'ea-1', organizationId: ORG_ID, status: from };
        const updated = { ...account, status: to };

        mockRepository.findExpenseAccountByIdAndOrg.mockResolvedValue(account);
        mockRepository.updateExpenseAccount.mockResolvedValue(updated);

        const result = await service.changeExpenseAccountStatus(
          'ea-1',
          { status: to } as any,
          ACTOR_ID,
          ORG_ID,
        );
        expect(result.status).toBe(to);
      },
    );

    const invalidTransitions: [string, string][] = [
      ['DRAFT', 'INVOICED'],
      ['DRAFT', 'CLOSED'],
      ['GENERATED', 'INVOICED'],
      ['CLOSED', 'DRAFT'],
      ['CLOSED', 'GENERATED'],
    ];

    it.each(invalidTransitions)(
      'should reject expense account transition from %s to %s',
      async (from, to) => {
        mockRepository.findExpenseAccountByIdAndOrg.mockResolvedValue({
          id: 'ea-1',
          organizationId: ORG_ID,
          status: from,
        });

        await expect(
          service.changeExpenseAccountStatus(
            'ea-1',
            { status: to } as any,
            ACTOR_ID,
            ORG_ID,
          ),
        ).rejects.toThrow(BadRequestException);
      },
    );
  });
});
