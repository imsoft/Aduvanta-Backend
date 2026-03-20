import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TreasuryService } from './treasury.service.js';
import { TreasuryRepository } from './treasury.repository.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';

const mockRepository = {
  findBankAccountsByOrganization: jest.fn(),
  findBankAccountByIdAndOrg: jest.fn(),
  insertBankAccount: jest.fn(),
  updateBankAccount: jest.fn(),
  deleteBankAccount: jest.fn(),
  findMovementsByOrganization: jest.fn(),
  searchMovements: jest.fn(),
  findMovementByIdAndOrg: jest.fn(),
  findMovementsByBankAccount: jest.fn(),
  insertMovement: jest.fn(),
  updateMovement: jest.fn(),
  findClientBalancesByOrganization: jest.fn(),
  findClientBalance: jest.fn(),
  upsertClientBalance: jest.fn(),
};

const mockAuditLogsService = {
  log: jest.fn().mockResolvedValue(undefined),
};

const ORG_ID = 'org-1';
const ACTOR_ID = 'user-1';

function makeBankAccount(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ba-1',
    organizationId: ORG_ID,
    type: 'CHECKING',
    bankName: 'Banorte',
    accountName: 'Operaciones',
    accountNumber: '1234567890',
    clabe: '072180012345678901',
    currency: 'MXN',
    currentBalance: '10000.00',
    isActive: true,
    createdById: ACTOR_ID,
    ...overrides,
  };
}

function makeMovement(overrides: Record<string, unknown> = {}) {
  return {
    id: 'mov-1',
    organizationId: ORG_ID,
    type: 'INCOME',
    category: 'CLIENT_ADVANCE',
    bankAccountId: 'ba-1',
    destinationAccountId: null,
    amount: '5000.00',
    currency: 'MXN',
    status: 'PENDING',
    description: 'Client advance',
    createdById: ACTOR_ID,
    ...overrides,
  };
}

describe('TreasuryService', () => {
  let service: TreasuryService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        TreasuryService,
        { provide: TreasuryRepository, useValue: mockRepository },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    }).compile();

    service = module.get(TreasuryService);
  });

  // --- Bank Accounts ---

  describe('createBankAccount', () => {
    it('should create a bank account and log audit', async () => {
      const created = makeBankAccount();
      mockRepository.insertBankAccount.mockResolvedValue(created);

      const dto = {
        type: 'CHECKING',
        bankName: 'Banorte',
        accountName: 'Operaciones',
        accountNumber: '1234567890',
        clabe: '072180012345678901',
      };

      const result = await service.createBankAccount(
        dto as any,
        ACTOR_ID,
        ORG_ID,
      );

      expect(result).toEqual(created);
      expect(mockRepository.insertBankAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: ORG_ID,
          bankName: 'Banorte',
        }),
      );
      expect(mockAuditLogsService.log).toHaveBeenCalled();
    });
  });

  describe('getBankAccountById', () => {
    it('should throw NotFoundException if bank account not found', async () => {
      mockRepository.findBankAccountByIdAndOrg.mockResolvedValue(undefined);

      await expect(
        service.getBankAccountById('bad-id', ORG_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // --- Create Movement ---

  describe('createMovement', () => {
    it('should create a PENDING movement', async () => {
      const account = makeBankAccount();
      const movement = makeMovement();

      mockRepository.findBankAccountByIdAndOrg.mockResolvedValue(account);
      mockRepository.insertMovement.mockResolvedValue(movement);

      const dto = {
        type: 'INCOME',
        category: 'CLIENT_ADVANCE',
        bankAccountId: 'ba-1',
        amount: '5000.00',
        description: 'Client advance',
      };

      const result = await service.createMovement(dto as any, ACTOR_ID, ORG_ID);

      expect(result.status).toBe('PENDING');
      expect(mockRepository.insertMovement).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'PENDING' }),
      );
    });

    it('should validate destination account for transfers', async () => {
      const account = makeBankAccount();
      const destAccount = makeBankAccount({ id: 'ba-2' });

      mockRepository.findBankAccountByIdAndOrg
        .mockResolvedValueOnce(account)
        .mockResolvedValueOnce(destAccount);
      mockRepository.insertMovement.mockResolvedValue(
        makeMovement({ type: 'TRANSFER', destinationAccountId: 'ba-2' }),
      );

      const dto = {
        type: 'TRANSFER',
        category: 'INTERNAL_TRANSFER',
        bankAccountId: 'ba-1',
        destinationAccountId: 'ba-2',
        amount: '1000.00',
      };

      await expect(
        service.createMovement(dto as any, ACTOR_ID, ORG_ID),
      ).resolves.toBeDefined();
      expect(mockRepository.findBankAccountByIdAndOrg).toHaveBeenCalledTimes(2);
    });
  });

  // --- Confirm Movement ---

  describe('confirmMovement', () => {
    it('should increase balance for INCOME movement', async () => {
      const movement = makeMovement({
        type: 'INCOME',
        amount: '5000.00',
        status: 'PENDING',
      });
      const account = makeBankAccount({ currentBalance: '10000.00' });

      mockRepository.findMovementByIdAndOrg.mockResolvedValue(movement);
      mockRepository.findBankAccountByIdAndOrg.mockResolvedValue(account);
      mockRepository.updateBankAccount.mockResolvedValue({});
      mockRepository.updateMovement.mockResolvedValue({
        ...movement,
        status: 'CONFIRMED',
      });

      const result = await service.confirmMovement('mov-1', ACTOR_ID, ORG_ID);

      expect(result.status).toBe('CONFIRMED');
      expect(mockRepository.updateBankAccount).toHaveBeenCalledWith('ba-1', {
        currentBalance: '15000.00',
      });
    });

    it('should decrease balance for EXPENSE movement', async () => {
      const movement = makeMovement({
        type: 'EXPENSE',
        amount: '3000.00',
        status: 'PENDING',
      });
      const account = makeBankAccount({ currentBalance: '10000.00' });

      mockRepository.findMovementByIdAndOrg.mockResolvedValue(movement);
      mockRepository.findBankAccountByIdAndOrg.mockResolvedValue(account);
      mockRepository.updateBankAccount.mockResolvedValue({});
      mockRepository.updateMovement.mockResolvedValue({
        ...movement,
        status: 'CONFIRMED',
      });

      await service.confirmMovement('mov-1', ACTOR_ID, ORG_ID);

      expect(mockRepository.updateBankAccount).toHaveBeenCalledWith('ba-1', {
        currentBalance: '7000.00',
      });
    });

    it('should decrease source and credit destination for TRANSFER', async () => {
      const movement = makeMovement({
        type: 'TRANSFER',
        amount: '2000.00',
        status: 'PENDING',
        destinationAccountId: 'ba-2',
      });
      const sourceAccount = makeBankAccount({
        id: 'ba-1',
        currentBalance: '10000.00',
      });
      const destAccount = makeBankAccount({
        id: 'ba-2',
        currentBalance: '5000.00',
      });

      mockRepository.findMovementByIdAndOrg.mockResolvedValue(movement);
      mockRepository.findBankAccountByIdAndOrg
        .mockResolvedValueOnce(sourceAccount) // getBankAccountById for source
        .mockResolvedValueOnce(destAccount); // getBankAccountById for destination
      mockRepository.updateBankAccount.mockResolvedValue({});
      mockRepository.updateMovement.mockResolvedValue({
        ...movement,
        status: 'CONFIRMED',
      });

      await service.confirmMovement('mov-1', ACTOR_ID, ORG_ID);

      // Source: 10000 - 2000 = 8000
      expect(mockRepository.updateBankAccount).toHaveBeenCalledWith('ba-1', {
        currentBalance: '8000.00',
      });
      // Destination: 5000 + 2000 = 7000
      expect(mockRepository.updateBankAccount).toHaveBeenCalledWith('ba-2', {
        currentBalance: '7000.00',
      });
    });

    it('should reject confirming a non-PENDING movement', async () => {
      mockRepository.findMovementByIdAndOrg.mockResolvedValue(
        makeMovement({ status: 'CONFIRMED' }),
      );

      await expect(
        service.confirmMovement('mov-1', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject confirming a CANCELLED movement', async () => {
      mockRepository.findMovementByIdAndOrg.mockResolvedValue(
        makeMovement({ status: 'CANCELLED' }),
      );

      await expect(
        service.confirmMovement('mov-1', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // --- Reconcile Movement ---

  describe('reconcileMovement', () => {
    it('should reconcile a CONFIRMED movement', async () => {
      const movement = makeMovement({ status: 'CONFIRMED' });
      const reconciled = { ...movement, status: 'RECONCILED' };

      mockRepository.findMovementByIdAndOrg.mockResolvedValue(movement);
      mockRepository.updateMovement.mockResolvedValue(reconciled);

      const result = await service.reconcileMovement('mov-1', ACTOR_ID, ORG_ID);
      expect(result.status).toBe('RECONCILED');
    });

    it('should reject reconciling a PENDING movement', async () => {
      mockRepository.findMovementByIdAndOrg.mockResolvedValue(
        makeMovement({ status: 'PENDING' }),
      );

      await expect(
        service.reconcileMovement('mov-1', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject reconciling a CANCELLED movement', async () => {
      mockRepository.findMovementByIdAndOrg.mockResolvedValue(
        makeMovement({ status: 'CANCELLED' }),
      );

      await expect(
        service.reconcileMovement('mov-1', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // --- Cancel Movement ---

  describe('cancelMovement', () => {
    it('should cancel a PENDING movement without balance reversal', async () => {
      const movement = makeMovement({ status: 'PENDING' });
      const cancelled = { ...movement, status: 'CANCELLED' };

      mockRepository.findMovementByIdAndOrg.mockResolvedValue(movement);
      mockRepository.updateMovement.mockResolvedValue(cancelled);

      const result = await service.cancelMovement('mov-1', ACTOR_ID, ORG_ID);

      expect(result.status).toBe('CANCELLED');
      // Should NOT update bank account balance for PENDING
      expect(mockRepository.updateBankAccount).not.toHaveBeenCalled();
    });

    it('should reverse INCOME balance when cancelling CONFIRMED movement', async () => {
      const movement = makeMovement({
        type: 'INCOME',
        amount: '5000.00',
        status: 'CONFIRMED',
      });
      const account = makeBankAccount({ currentBalance: '15000.00' });

      mockRepository.findMovementByIdAndOrg.mockResolvedValue(movement);
      mockRepository.findBankAccountByIdAndOrg.mockResolvedValue(account);
      mockRepository.updateBankAccount.mockResolvedValue({});
      mockRepository.updateMovement.mockResolvedValue({
        ...movement,
        status: 'CANCELLED',
      });

      await service.cancelMovement('mov-1', ACTOR_ID, ORG_ID);

      // Reverse: 15000 - 5000 = 10000
      expect(mockRepository.updateBankAccount).toHaveBeenCalledWith('ba-1', {
        currentBalance: '10000.00',
      });
    });

    it('should reverse EXPENSE balance when cancelling CONFIRMED movement', async () => {
      const movement = makeMovement({
        type: 'EXPENSE',
        amount: '3000.00',
        status: 'CONFIRMED',
      });
      const account = makeBankAccount({ currentBalance: '7000.00' });

      mockRepository.findMovementByIdAndOrg.mockResolvedValue(movement);
      mockRepository.findBankAccountByIdAndOrg.mockResolvedValue(account);
      mockRepository.updateBankAccount.mockResolvedValue({});
      mockRepository.updateMovement.mockResolvedValue({
        ...movement,
        status: 'CANCELLED',
      });

      await service.cancelMovement('mov-1', ACTOR_ID, ORG_ID);

      // Reverse expense: 7000 + 3000 = 10000
      expect(mockRepository.updateBankAccount).toHaveBeenCalledWith('ba-1', {
        currentBalance: '10000.00',
      });
    });

    it('should reverse both accounts for cancelled CONFIRMED transfer', async () => {
      const movement = makeMovement({
        type: 'TRANSFER',
        amount: '2000.00',
        status: 'CONFIRMED',
        destinationAccountId: 'ba-2',
      });
      const sourceAccount = makeBankAccount({
        id: 'ba-1',
        currentBalance: '8000.00',
      });
      const destAccount = makeBankAccount({
        id: 'ba-2',
        currentBalance: '7000.00',
      });

      mockRepository.findMovementByIdAndOrg.mockResolvedValue(movement);
      mockRepository.findBankAccountByIdAndOrg
        .mockResolvedValueOnce(sourceAccount)
        .mockResolvedValueOnce(destAccount);
      mockRepository.updateBankAccount.mockResolvedValue({});
      mockRepository.updateMovement.mockResolvedValue({
        ...movement,
        status: 'CANCELLED',
      });

      await service.cancelMovement('mov-1', ACTOR_ID, ORG_ID);

      // Source: 8000 + 2000 = 10000
      expect(mockRepository.updateBankAccount).toHaveBeenCalledWith('ba-1', {
        currentBalance: '10000.00',
      });
      // Destination: 7000 - 2000 = 5000
      expect(mockRepository.updateBankAccount).toHaveBeenCalledWith('ba-2', {
        currentBalance: '5000.00',
      });
    });

    it('should reject cancelling an already cancelled movement', async () => {
      mockRepository.findMovementByIdAndOrg.mockResolvedValue(
        makeMovement({ status: 'CANCELLED' }),
      );

      await expect(
        service.cancelMovement('mov-1', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject cancelling a RECONCILED movement', async () => {
      mockRepository.findMovementByIdAndOrg.mockResolvedValue(
        makeMovement({ status: 'RECONCILED' }),
      );

      await expect(
        service.cancelMovement('mov-1', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
