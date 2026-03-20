import { Injectable } from '@nestjs/common';
import { OperationsService } from '../operations/operations.service.js';
import { OperationComplianceService } from '../operation-compliance/operation-compliance.service.js';
import { OperationFinanceService } from '../operation-finance/operation-finance.service.js';
import type { OperationComplianceEvaluation } from '../operation-compliance/operation-compliance.service.js';
import type { OperationFinanceSummary } from '../operation-finance/operation-finance.service.js';
import type { OperationRecord } from '../operations/operations.repository.js';

export interface OperationAiSummary {
  operationId: string;
  overview: string;
  documentStatus: string;
  complianceStatus: string;
  financeStatus: string;
  nextSuggestedStep: string;
}

@Injectable()
export class AiSummariesService {
  constructor(
    private readonly operationsService: OperationsService,
    private readonly complianceService: OperationComplianceService,
    private readonly financeService: OperationFinanceService,
  ) {}

  async generateSummary(
    operationId: string,
    organizationId: string,
  ): Promise<OperationAiSummary> {
    const [operation, compliance, finance] = await Promise.all([
      this.operationsService.getById(operationId, organizationId),
      this.complianceService.evaluate(operationId, organizationId),
      this.financeService.getSummary(operationId, organizationId),
    ]);

    return {
      operationId,
      overview: buildOverview(operation),
      documentStatus: buildDocumentStatus(compliance),
      complianceStatus: buildComplianceStatus(compliance),
      financeStatus: buildFinanceStatus(finance),
      nextSuggestedStep: buildNextStep(operation, compliance, finance),
    };
  }
}

function buildOverview(operation: OperationRecord): string {
  const isClosedStatus =
    operation.status === 'COMPLETED' || operation.status === 'CANCELLED';
  const dueStr = operation.dueAt
    ? ` Due: ${new Date(operation.dueAt).toLocaleDateString()}.`
    : '';
  const assigneeStr = operation.assignedUserId
    ? ''
    : ' No user is currently assigned.';
  const closedStr =
    isClosedStatus && operation.closedAt
      ? ` Closed on ${new Date(operation.closedAt).toLocaleDateString()}.`
      : '';

  return `Operation ${operation.reference} — "${operation.title}" is ${operation.status} with ${operation.priority} priority.${dueStr}${assigneeStr}${closedStr}`;
}

function buildDocumentStatus(
  compliance: OperationComplianceEvaluation,
): string {
  if (compliance.missingRequiredDocumentCategories.length === 0) {
    const count = compliance.presentDocumentCategories.length;
    return `All required documents are present (${count} categor${count === 1 ? 'y' : 'ies'} uploaded).`;
  }

  const missing = compliance.missingRequiredDocumentCategories
    .map((c) => c.name)
    .join(', ');
  return `${compliance.missingRequiredDocumentCategories.length} required document categor${compliance.missingRequiredDocumentCategories.length === 1 ? 'y is' : 'ies are'} missing: ${missing}.`;
}

function buildComplianceStatus(
  compliance: OperationComplianceEvaluation,
): string {
  if (!compliance.ruleSetId) {
    return 'No compliance rule set is configured for this operation type.';
  }

  if (compliance.alerts.length === 0) {
    return `Compliance is satisfied under rule set "${compliance.ruleSetName}".`;
  }

  return `${compliance.alerts.length} compliance issue(s) detected under rule set "${compliance.ruleSetName}".`;
}

function buildFinanceStatus(finance: OperationFinanceSummary): string {
  if (finance.financialStatus === 'NO_CHARGES') {
    return 'No charges have been registered for this operation.';
  }

  return `Total charges: ${finance.totalCharges}. Total advances: ${finance.totalAdvances}. Pending balance: ${finance.pendingBalance}. Status: ${finance.financialStatus}.`;
}

function buildNextStep(
  operation: OperationRecord,
  compliance: OperationComplianceEvaluation,
  finance: OperationFinanceSummary,
): string {
  if (operation.status === 'COMPLETED' || operation.status === 'CANCELLED') {
    return `Operation is ${operation.status}. No further action required.`;
  }

  if (!operation.assignedUserId) {
    return 'Assign a team member to this operation to ensure it is actively managed.';
  }

  if (compliance.missingRequiredDocumentCategories.length > 0) {
    const names = compliance.missingRequiredDocumentCategories
      .map((c) => c.name)
      .join(', ');
    return `Upload the missing required documents: ${names}.`;
  }

  const allTransitionsBlocked =
    compliance.allowedTransitions.length > 0 &&
    compliance.allowedTransitions.every((t) => t.isBlocked);
  if (allTransitionsBlocked) {
    return 'All available status transitions are blocked. Complete the required documents to advance the operation.';
  }

  if (parseFloat(finance.pendingBalance) > 0) {
    return `Register advances to cover the pending balance of ${finance.pendingBalance}.`;
  }

  return 'Review current status and advance the workflow to the next stage when ready.';
}
