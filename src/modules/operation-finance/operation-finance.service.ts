import { Injectable } from '@nestjs/common';
import { OperationsService } from '../operations/operations.service.js';
import { OperationChargesRepository } from '../operation-charges/operation-charges.repository.js';
import { OperationAdvancesRepository } from '../operation-advances/operation-advances.repository.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';

export type FinancialStatus =
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'NO_CHARGES';

export interface OperationFinanceSummary {
  totalCharges: string;
  totalAdvances: string;
  pendingBalance: string;
  financialStatus: FinancialStatus;
}

@Injectable()
export class OperationFinanceService {
  constructor(
    private readonly operationsService: OperationsService,
    private readonly chargesRepository: OperationChargesRepository,
    private readonly advancesRepository: OperationAdvancesRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async getSummary(
    operationId: string,
    organizationId: string,
  ): Promise<OperationFinanceSummary> {
    await this.operationsService.getById(operationId, organizationId);

    const [charges, advances] = await Promise.all([
      this.chargesRepository.findActiveByOperation(operationId, organizationId),
      this.advancesRepository.findActiveByOperation(
        operationId,
        organizationId,
      ),
    ]);

    const totalCharges = charges.reduce(
      (sum, c) => sum + parseFloat(c.amount),
      0,
    );
    const totalAdvances = advances.reduce(
      (sum, a) => sum + parseFloat(a.amount),
      0,
    );
    const pendingBalance = totalCharges - totalAdvances;

    const financialStatus = computeFinancialStatus(
      totalCharges,
      totalAdvances,
      pendingBalance,
    );

    return {
      totalCharges: totalCharges.toFixed(4),
      totalAdvances: totalAdvances.toFixed(4),
      pendingBalance: pendingBalance.toFixed(4),
      financialStatus,
    };
  }

  async generateExpenseAccount(
    operationId: string,
    organizationId: string,
    actorId: string,
  ): Promise<OperationFinanceSummary> {
    const summary = await this.getSummary(operationId, organizationId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.FINANCE_EXPENSE_ACCOUNT_GENERATED,
      resource: 'operation',
      resourceId: operationId,
      metadata: {
        totalCharges: summary.totalCharges,
        totalAdvances: summary.totalAdvances,
        pendingBalance: summary.pendingBalance,
        financialStatus: summary.financialStatus,
      },
    });

    return summary;
  }
}

function computeFinancialStatus(
  totalCharges: number,
  totalAdvances: number,
  pendingBalance: number,
): FinancialStatus {
  if (totalCharges === 0) return 'NO_CHARGES';
  if (pendingBalance <= 0) return 'PAID';
  if (totalAdvances > 0) return 'PARTIALLY_PAID';
  return 'PENDING';
}
