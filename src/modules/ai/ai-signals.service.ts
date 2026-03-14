import { Injectable } from '@nestjs/common';
import { OperationsService } from '../operations/operations.service.js';
import { OperationComplianceService } from '../operation-compliance/operation-compliance.service.js';
import { OperationFinanceService } from '../operation-finance/operation-finance.service.js';

export type SignalSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type SignalCode =
  | 'MISSING_REQUIRED_DOCUMENTS'
  | 'BLOCKED_STATUS_TRANSITION'
  | 'OVERDUE_OPERATION'
  | 'NO_ASSIGNEE'
  | 'PENDING_FINANCIAL_BALANCE';

export interface OperationSignal {
  code: SignalCode;
  severity: SignalSeverity;
  title: string;
  description: string;
  source: string;
}

@Injectable()
export class AiSignalsService {
  constructor(
    private readonly operationsService: OperationsService,
    private readonly complianceService: OperationComplianceService,
    private readonly financeService: OperationFinanceService,
  ) {}

  async computeSignals(
    operationId: string,
    organizationId: string,
  ): Promise<OperationSignal[]> {
    const [operation, compliance, finance] = await Promise.all([
      this.operationsService.getById(operationId, organizationId),
      this.complianceService.evaluate(operationId, organizationId),
      this.financeService.getSummary(operationId, organizationId),
    ]);

    const signals: OperationSignal[] = [];

    if (compliance.missingRequiredDocumentCategories.length > 0) {
      const names = compliance.missingRequiredDocumentCategories
        .map((c) => c.name)
        .join(', ');
      signals.push({
        code: 'MISSING_REQUIRED_DOCUMENTS',
        severity: 'CRITICAL',
        title: 'Missing required documents',
        description: `${compliance.missingRequiredDocumentCategories.length} required document category(ies) are missing: ${names}.`,
        source: 'compliance',
      });
    }

    const blockedTransitions = compliance.allowedTransitions.filter(
      (t) => t.isBlocked,
    );
    if (blockedTransitions.length > 0) {
      const targets = blockedTransitions.map((t) => t.toStatus).join(', ');
      signals.push({
        code: 'BLOCKED_STATUS_TRANSITION',
        severity: 'WARNING',
        title: 'Status transition blocked',
        description: `Transition to ${targets} is blocked due to missing required documents.`,
        source: 'compliance',
      });
    }

    const isClosedStatus =
      operation.status === 'COMPLETED' || operation.status === 'CANCELLED';

    if (operation.dueAt && !isClosedStatus) {
      const dueDate = new Date(operation.dueAt);
      if (dueDate < new Date()) {
        signals.push({
          code: 'OVERDUE_OPERATION',
          severity: 'CRITICAL',
          title: 'Operation is overdue',
          description: `Due date was ${dueDate.toLocaleDateString()} and the operation is still open.`,
          source: 'operation',
        });
      }
    }

    if (!operation.assignedUserId && !isClosedStatus) {
      signals.push({
        code: 'NO_ASSIGNEE',
        severity: 'WARNING',
        title: 'No assignee',
        description:
          'This operation has no assigned user. Assign a team member to ensure accountability.',
        source: 'operation',
      });
    }

    const pendingBalance = parseFloat(finance.pendingBalance);
    if (pendingBalance > 0) {
      signals.push({
        code: 'PENDING_FINANCIAL_BALANCE',
        severity: 'INFO',
        title: 'Pending financial balance',
        description: `There is a pending balance of ${finance.pendingBalance} not yet covered by advances.`,
        source: 'finance',
      });
    }

    return signals;
  }
}
