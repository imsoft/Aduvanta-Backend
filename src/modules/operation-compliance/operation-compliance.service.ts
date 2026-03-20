import { Injectable } from '@nestjs/common';
import { OperationsService } from '../operations/operations.service.js';
import { ComplianceRuleSetsRepository } from '../compliance-rule-sets/compliance-rule-sets.repository.js';
import { ComplianceDocumentRequirementsRepository } from '../compliance-document-requirements/compliance-document-requirements.repository.js';
import { ComplianceStatusRulesRepository } from '../compliance-status-rules/compliance-status-rules.repository.js';
import { DocumentsRepository } from '../documents/documents.repository.js';
import { DocumentCategoriesRepository } from '../document-categories/document-categories.repository.js';

export interface CategoryRef {
  id: string;
  name: string;
  code: string;
}

export interface AllowedTransition {
  toStatus: string;
  requiresAllRequiredDocuments: boolean;
  isBlocked: boolean;
  blockReason: string | null;
}

export type ComplianceAlertType =
  | 'NO_RULE_SET'
  | 'MISSING_REQUIRED_DOCUMENT'
  | 'TRANSITION_BLOCKED';

export interface ComplianceAlert {
  type: ComplianceAlertType;
  message: string;
}

export interface OperationComplianceEvaluation {
  operationId: string;
  operationType: string;
  ruleSetId: string | null;
  ruleSetName: string | null;
  requiredDocumentCategories: CategoryRef[];
  presentDocumentCategories: CategoryRef[];
  missingRequiredDocumentCategories: CategoryRef[];
  allowedTransitions: AllowedTransition[];
  canCurrentWorkflowAdvance: boolean;
  alerts: ComplianceAlert[];
}

@Injectable()
export class OperationComplianceService {
  constructor(
    private readonly operationsService: OperationsService,
    private readonly ruleSetsRepository: ComplianceRuleSetsRepository,
    private readonly docRequirementsRepository: ComplianceDocumentRequirementsRepository,
    private readonly statusRulesRepository: ComplianceStatusRulesRepository,
    private readonly documentsRepository: DocumentsRepository,
    private readonly categoriesRepository: DocumentCategoriesRepository,
  ) {}

  async evaluate(
    operationId: string,
    organizationId: string,
  ): Promise<OperationComplianceEvaluation> {
    const operation = await this.operationsService.getById(
      operationId,
      organizationId,
    );

    const ruleSet = await this.ruleSetsRepository.findActiveByOperationType(
      operation.type,
      organizationId,
    );

    if (!ruleSet) {
      return {
        operationId,
        operationType: operation.type,
        ruleSetId: null,
        ruleSetName: null,
        requiredDocumentCategories: [],
        presentDocumentCategories: [],
        missingRequiredDocumentCategories: [],
        allowedTransitions: [],
        canCurrentWorkflowAdvance: false,
        alerts: [
          {
            type: 'NO_RULE_SET',
            message: `No active rule set found for operation type "${operation.type}". Configure one in the Compliance area.`,
          },
        ],
      };
    }

    // Required document categories from rule set.
    const docRequirements = await this.docRequirementsRepository.findByRuleSet(
      ruleSet.id,
      organizationId,
    );
    const requiredReqs = docRequirements.filter((r) => r.isRequired);
    const requiredCategoryIds = new Set(
      requiredReqs.map((r) => r.documentCategoryId),
    );

    // Active documents on this operation.
    const activeDocuments = await this.documentsRepository.findByOperation({
      operationId,
      organizationId,
      status: 'ACTIVE',
      limit: 1000,
      offset: 0,
    });

    const presentCategoryIds = new Set(
      activeDocuments
        .filter((d) => d.categoryId !== null)
        .map((d) => d.categoryId as string),
    );

    // Fetch category details for all referenced IDs.
    const allCategoryIds = new Set([
      ...requiredCategoryIds,
      ...presentCategoryIds,
    ]);
    const categoryMap = await this.buildCategoryMap(
      [...allCategoryIds],
      organizationId,
    );

    const requiredDocumentCategories: CategoryRef[] = [...requiredCategoryIds]
      .filter((id) => categoryMap.has(id))
      .map((id) => categoryMap.get(id)!);

    const presentDocumentCategories: CategoryRef[] = [...presentCategoryIds]
      .filter((id) => categoryMap.has(id))
      .map((id) => categoryMap.get(id)!);

    const missingIds = [...requiredCategoryIds].filter(
      (id) => !presentCategoryIds.has(id),
    );
    const missingRequiredDocumentCategories: CategoryRef[] = missingIds
      .filter((id) => categoryMap.has(id))
      .map((id) => categoryMap.get(id)!);

    const hasMissingDocs = missingRequiredDocumentCategories.length > 0;

    // Allowed transitions from current status.
    const transitionRules =
      await this.statusRulesRepository.findByRuleSetAndFromStatus(
        ruleSet.id,
        operation.status,
      );

    const allowedTransitions: AllowedTransition[] = transitionRules.map(
      (rule) => {
        const isBlocked = rule.requiresAllRequiredDocuments && hasMissingDocs;
        return {
          toStatus: rule.toStatus,
          requiresAllRequiredDocuments: rule.requiresAllRequiredDocuments,
          isBlocked,
          blockReason: isBlocked
            ? `Missing ${missingRequiredDocumentCategories.length} required document(s) before transitioning to ${rule.toStatus}`
            : null,
        };
      },
    );

    const canCurrentWorkflowAdvance =
      allowedTransitions.length > 0 &&
      allowedTransitions.some((t) => !t.isBlocked);

    const alerts: ComplianceAlert[] = [];

    for (const missing of missingRequiredDocumentCategories) {
      alerts.push({
        type: 'MISSING_REQUIRED_DOCUMENT',
        message: `Required document category "${missing.name}" (${missing.code}) is missing`,
      });
    }

    for (const blocked of allowedTransitions.filter((t) => t.isBlocked)) {
      alerts.push({
        type: 'TRANSITION_BLOCKED',
        message:
          blocked.blockReason ??
          `Transition to ${blocked.toStatus} is blocked by missing required documents`,
      });
    }

    return {
      operationId,
      operationType: operation.type,
      ruleSetId: ruleSet.id,
      ruleSetName: ruleSet.name,
      requiredDocumentCategories,
      presentDocumentCategories,
      missingRequiredDocumentCategories,
      allowedTransitions,
      canCurrentWorkflowAdvance,
      alerts,
    };
  }

  private async buildCategoryMap(
    ids: string[],
    organizationId: string,
  ): Promise<Map<string, CategoryRef>> {
    const map = new Map<string, CategoryRef>();

    await Promise.all(
      ids.map(async (id) => {
        const cat = await this.categoriesRepository.findById(id);
        if (cat && cat.organizationId === organizationId) {
          map.set(id, { id: cat.id, name: cat.name, code: cat.code });
        }
      }),
    );

    return map;
  }
}
