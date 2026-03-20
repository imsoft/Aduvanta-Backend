import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  TreasuryRepository,
  type BankAccountRecord,
  type FundMovementRecord,
  type ClientBalanceRecord,
} from './treasury.repository.js';
import type { CreateBankAccountDto } from './dto/create-bank-account.dto.js';
import type { UpdateBankAccountDto } from './dto/update-bank-account.dto.js';
import type { CreateFundMovementDto } from './dto/create-fund-movement.dto.js';

@Injectable()
export class TreasuryService {
  constructor(
    private readonly repository: TreasuryRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  // ========== Bank Accounts ==========

  async listBankAccounts(organizationId: string): Promise<BankAccountRecord[]> {
    return this.repository.findBankAccountsByOrganization(organizationId);
  }

  async getBankAccountById(
    id: string,
    organizationId: string,
  ): Promise<BankAccountRecord> {
    const account = await this.repository.findBankAccountByIdAndOrg(
      id,
      organizationId,
    );

    if (!account) {
      throw new NotFoundException(`Bank account ${id} not found`);
    }

    return account;
  }

  async createBankAccount(
    dto: CreateBankAccountDto,
    actorId: string,
    organizationId: string,
  ): Promise<BankAccountRecord> {
    const account = await this.repository.insertBankAccount({
      organizationId,
      type: dto.type as 'CHECKING',
      bankName: dto.bankName,
      accountName: dto.accountName,
      accountNumber: dto.accountNumber,
      clabe: dto.clabe,
      currency: dto.currency ?? 'MXN',
      currentBalance: dto.currentBalance ?? '0',
      isActive: dto.isActive ?? true,
      observations: dto.observations,
      createdById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.BANK_ACCOUNT_CREATED,
      resource: 'bank_account',
      resourceId: account.id,
      metadata: {
        bankName: account.bankName,
        accountName: account.accountName,
        type: account.type,
      },
    });

    return account;
  }

  async updateBankAccount(
    id: string,
    dto: UpdateBankAccountDto,
    actorId: string,
    organizationId: string,
  ): Promise<BankAccountRecord> {
    await this.getBankAccountById(id, organizationId);

    const updated = await this.repository.updateBankAccount(id, {
      ...dto,
      type: dto.type as 'CHECKING' | undefined,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.BANK_ACCOUNT_UPDATED,
      resource: 'bank_account',
      resourceId: id,
      metadata: { ...dto },
    });

    return updated;
  }

  async deleteBankAccount(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const account = await this.getBankAccountById(id, organizationId);

    await this.repository.deleteBankAccount(id);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.BANK_ACCOUNT_DELETED,
      resource: 'bank_account',
      resourceId: id,
      metadata: {
        bankName: account.bankName,
        accountName: account.accountName,
      },
    });
  }

  async getBankAccountMovements(
    id: string,
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ movements: FundMovementRecord[]; total: number }> {
    await this.getBankAccountById(id, organizationId);
    return this.repository.findMovementsByBankAccount(id, limit, offset);
  }

  // ========== Fund Movements ==========

  async listMovements(
    organizationId: string,
    limit: number,
    offset: number,
  ): Promise<{ movements: FundMovementRecord[]; total: number }> {
    return this.repository.findMovementsByOrganization(
      organizationId,
      limit,
      offset,
    );
  }

  async searchMovements(
    organizationId: string,
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ movements: FundMovementRecord[]; total: number }> {
    return this.repository.searchMovements(
      organizationId,
      query,
      limit,
      offset,
    );
  }

  async getMovementById(
    id: string,
    organizationId: string,
  ): Promise<FundMovementRecord> {
    const movement = await this.repository.findMovementByIdAndOrg(
      id,
      organizationId,
    );

    if (!movement) {
      throw new NotFoundException(`Fund movement ${id} not found`);
    }

    return movement;
  }

  async createMovement(
    dto: CreateFundMovementDto,
    actorId: string,
    organizationId: string,
  ): Promise<FundMovementRecord> {
    // Validate bank account belongs to org
    await this.getBankAccountById(dto.bankAccountId, organizationId);

    if (dto.destinationAccountId) {
      await this.getBankAccountById(dto.destinationAccountId, organizationId);
    }

    const movement = await this.repository.insertMovement({
      organizationId,
      type: dto.type as 'INCOME',
      category: dto.category as 'CLIENT_ADVANCE',
      bankAccountId: dto.bankAccountId,
      destinationAccountId: dto.destinationAccountId,
      amount: dto.amount,
      currency: dto.currency ?? 'MXN',
      exchangeRate: dto.exchangeRate,
      amountMxn: dto.amountMxn,
      referenceNumber: dto.referenceNumber,
      description: dto.description,
      movementDate: dto.movementDate,
      clientId: dto.clientId,
      invoiceId: dto.invoiceId,
      paymentId: dto.paymentId,
      shipmentId: dto.shipmentId,
      entryId: dto.entryId,
      observations: dto.observations,
      createdById: actorId,
      status: 'PENDING',
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.FUND_MOVEMENT_CREATED,
      resource: 'fund_movement',
      resourceId: movement.id,
      metadata: {
        type: movement.type,
        category: movement.category,
        amount: movement.amount,
        bankAccountId: movement.bankAccountId,
      },
    });

    return movement;
  }

  async confirmMovement(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<FundMovementRecord> {
    const movement = await this.getMovementById(id, organizationId);

    if (movement.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot confirm movement in status ${movement.status}`,
      );
    }

    const account = await this.getBankAccountById(
      movement.bankAccountId,
      organizationId,
    );

    // Update bank account balance
    const currentBalance = parseFloat(account.currentBalance);
    const amount = parseFloat(movement.amount);
    let newBalance: number;

    if (movement.type === 'INCOME') {
      newBalance = currentBalance + amount;
    } else if (movement.type === 'EXPENSE' || movement.type === 'TRANSFER') {
      newBalance = currentBalance - amount;
    } else {
      newBalance = currentBalance + amount; // ADJUSTMENT — amount can be negative
    }

    await this.repository.updateBankAccount(movement.bankAccountId, {
      currentBalance: newBalance.toFixed(2),
    });

    // For transfers, credit destination account
    if (movement.type === 'TRANSFER' && movement.destinationAccountId) {
      const destAccount = await this.getBankAccountById(
        movement.destinationAccountId,
        organizationId,
      );
      const destBalance = parseFloat(destAccount.currentBalance) + amount;
      await this.repository.updateBankAccount(movement.destinationAccountId, {
        currentBalance: destBalance.toFixed(2),
      });
    }

    const confirmed = await this.repository.updateMovement(id, {
      status: 'CONFIRMED',
      balanceAfter: newBalance.toFixed(2),
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.FUND_MOVEMENT_CONFIRMED,
      resource: 'fund_movement',
      resourceId: id,
      metadata: {
        type: movement.type,
        amount: movement.amount,
        balanceAfter: newBalance.toFixed(2),
      },
    });

    return confirmed;
  }

  async reconcileMovement(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<FundMovementRecord> {
    const movement = await this.getMovementById(id, organizationId);

    if (movement.status !== 'CONFIRMED') {
      throw new BadRequestException(
        `Cannot reconcile movement in status ${movement.status}`,
      );
    }

    const reconciled = await this.repository.updateMovement(id, {
      status: 'RECONCILED',
      reconciledAt: new Date(),
      reconciledById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.FUND_MOVEMENT_RECONCILED,
      resource: 'fund_movement',
      resourceId: id,
      metadata: {
        type: movement.type,
        amount: movement.amount,
      },
    });

    return reconciled;
  }

  async cancelMovement(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<FundMovementRecord> {
    const movement = await this.getMovementById(id, organizationId);

    if (movement.status === 'CANCELLED' || movement.status === 'RECONCILED') {
      throw new BadRequestException(
        `Cannot cancel movement in status ${movement.status}`,
      );
    }

    // If confirmed, reverse the balance change
    if (movement.status === 'CONFIRMED') {
      const account = await this.getBankAccountById(
        movement.bankAccountId,
        organizationId,
      );
      const currentBalance = parseFloat(account.currentBalance);
      const amount = parseFloat(movement.amount);
      let reversedBalance: number;

      if (movement.type === 'INCOME') {
        reversedBalance = currentBalance - amount;
      } else if (movement.type === 'EXPENSE' || movement.type === 'TRANSFER') {
        reversedBalance = currentBalance + amount;
      } else {
        reversedBalance = currentBalance - amount;
      }

      await this.repository.updateBankAccount(movement.bankAccountId, {
        currentBalance: reversedBalance.toFixed(2),
      });

      // Reverse destination for transfers
      if (movement.type === 'TRANSFER' && movement.destinationAccountId) {
        const destAccount = await this.getBankAccountById(
          movement.destinationAccountId,
          organizationId,
        );
        const destBalance = parseFloat(destAccount.currentBalance) - amount;
        await this.repository.updateBankAccount(movement.destinationAccountId, {
          currentBalance: destBalance.toFixed(2),
        });
      }
    }

    const cancelled = await this.repository.updateMovement(id, {
      status: 'CANCELLED',
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.FUND_MOVEMENT_CANCELLED,
      resource: 'fund_movement',
      resourceId: id,
      metadata: {
        type: movement.type,
        amount: movement.amount,
        previousStatus: movement.status,
      },
    });

    return cancelled;
  }

  // ========== Client Balances ==========

  async listClientBalances(
    organizationId: string,
  ): Promise<ClientBalanceRecord[]> {
    return this.repository.findClientBalancesByOrganization(organizationId);
  }

  async getClientBalance(
    organizationId: string,
    clientId: string,
    currency: string,
  ): Promise<ClientBalanceRecord | undefined> {
    return this.repository.findClientBalance(
      organizationId,
      clientId,
      currency,
    );
  }
}
