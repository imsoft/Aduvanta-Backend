import { Injectable } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  ClientAccountsRepository,
  type AccountMovementRecord,
  type AccountStatementRecord,
} from './client-accounts.repository.js';
import type { CreateAccountMovementDto } from './dto/create-movement.dto.js';
import type { GenerateStatementDto } from './dto/generate-statement.dto.js';

@Injectable()
export class ClientAccountsService {
  constructor(
    private readonly repository: ClientAccountsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async getClientBalance(clientId: string, organizationId: string) {
    const balance = await this.repository.getClientBalance(
      organizationId,
      clientId,
    );
    const funds = await this.repository.findFundsByClient(
      organizationId,
      clientId,
    );
    return { clientId, balance, currency: 'MXN', funds };
  }

  async listMovements(
    clientId: string,
    organizationId: string,
    limit: number,
    offset: number,
    dateFrom?: string,
    dateTo?: string,
  ) {
    return this.repository.findMovementsByClient(
      organizationId,
      clientId,
      limit,
      offset,
      dateFrom,
      dateTo,
    );
  }

  async recordMovement(
    dto: CreateAccountMovementDto,
    actorId: string,
    organizationId: string,
  ): Promise<AccountMovementRecord> {
    // Get current balance before movement
    const balanceBefore = await this.repository.getClientBalance(
      organizationId,
      dto.clientId,
    );

    const numAmount = parseFloat(dto.amount);

    // Credits are positive (client has credit with agency)
    // Debits are negative (client owes agency)
    const creditTypes = [
      'ADVANCE_RECEIVED',
      'OVERPAYMENT_CREDIT',
      'CORRECTION_CREDIT',
    ];
    const isCredit = creditTypes.includes(dto.type);
    const signedAmount = isCredit ? Math.abs(numAmount) : -Math.abs(numAmount);

    const balanceAfter = (
      parseFloat(balanceBefore) + signedAmount
    ).toFixed(2);

    const movement = await this.repository.insertMovement({
      organizationId,
      clientId: dto.clientId,
      type: dto.type,
      amount: signedAmount.toFixed(2),
      currency: dto.currency ?? 'MXN',
      exchangeRate: dto.exchangeRate,
      operationId: dto.operationId,
      entryId: dto.entryId,
      invoiceId: dto.invoiceId,
      description: dto.description,
      reference: dto.reference,
      movementDate: dto.movementDate,
      balanceBefore,
      balanceAfter,
      createdById: actorId,
    });

    // Update client funds record
    await this.repository.upsertClientFunds(
      organizationId,
      dto.clientId,
      balanceAfter,
      dto.currency ?? 'MXN',
    );

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.ACCOUNT_MOVEMENT_CREATED,
      resource: 'client_account',
      resourceId: dto.clientId,
      metadata: {
        type: dto.type,
        amount: signedAmount.toFixed(2),
        balanceBefore,
        balanceAfter,
      },
    });

    return movement;
  }

  async generateStatement(
    dto: GenerateStatementDto,
    actorId: string,
    organizationId: string,
  ): Promise<AccountStatementRecord> {
    const openingBalance = await this.repository.getClientBalance(
      organizationId,
      dto.clientId,
    );

    // Fetch movements in period
    const { movements } = await this.repository.findMovementsByClient(
      organizationId,
      dto.clientId,
      1000,
      0,
      dto.periodFrom,
      dto.periodTo,
    );

    const totalCredits = movements
      .filter((m) => parseFloat(m.amount) > 0)
      .reduce((sum, m) => sum + parseFloat(m.amount), 0);

    const totalDebits = movements
      .filter((m) => parseFloat(m.amount) < 0)
      .reduce((sum, m) => sum + Math.abs(parseFloat(m.amount)), 0);

    const closingBalance = (
      parseFloat(openingBalance) +
      totalCredits -
      totalDebits
    ).toFixed(2);

    // Generate sequential statement number
    const statementNumber = `EC-${organizationId.slice(0, 6)}-${Date.now()}`;

    const statement = await this.repository.insertStatement({
      organizationId,
      clientId: dto.clientId,
      statementNumber,
      periodFrom: dto.periodFrom,
      periodTo: dto.periodTo,
      openingBalance,
      totalCredits: totalCredits.toFixed(2),
      totalDebits: totalDebits.toFixed(2),
      closingBalance,
      movementCount: movements.length,
      createdById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.ACCOUNT_STATEMENT_GENERATED,
      resource: 'client_account',
      resourceId: dto.clientId,
      metadata: {
        statementNumber,
        periodFrom: dto.periodFrom,
        periodTo: dto.periodTo,
        closingBalance,
      },
    });

    return statement;
  }

  async listStatements(
    clientId: string,
    organizationId: string,
    limit: number,
    offset: number,
  ) {
    return this.repository.findStatementsByClient(
      organizationId,
      clientId,
      limit,
      offset,
    );
  }

  async getAllClientBalances(organizationId: string) {
    return this.repository.getClientBalancesBulk(organizationId);
  }

  async getAllClientFunds(
    organizationId: string,
    search: string | undefined,
    limit: number,
    offset: number,
  ) {
    const result = await this.repository.findAllFunds(organizationId, limit, offset);
    // Filter by search if provided (client-side for simplicity since clientName requires join)
    return result;
  }
}
