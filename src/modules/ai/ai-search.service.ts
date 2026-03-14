import { Injectable } from '@nestjs/common';
import { OperationsRepository } from '../operations/operations.repository.js';
import type { AiSearchQueryType } from './dto/create-ai-search-query.dto.js';

export interface AiSearchResultItem {
  operationId: string;
  reference: string;
  title: string;
  status: string;
  priority: string;
  assignedUserId: string | null;
  dueAt: string | null;
  reason: string;
}

export interface AiSearchResult {
  queryType: AiSearchQueryType;
  queryText: string;
  supported: boolean;
  message: string;
  data: AiSearchResultItem[];
}

@Injectable()
export class AiSearchService {
  constructor(private readonly operationsRepository: OperationsRepository) {}

  async search(
    organizationId: string,
    queryType: AiSearchQueryType,
    queryText: string,
  ): Promise<AiSearchResult> {
    const allOps = await this.operationsRepository.findByOrganization({
      organizationId,
      limit: 1000,
      offset: 0,
    });

    const openOps = allOps.filter(
      (op) => op.status !== 'COMPLETED' && op.status !== 'CANCELLED',
    );

    switch (queryType) {
      case 'PENDING_OPERATIONS': {
        const data = openOps.map((op) => ({
          operationId: op.id,
          reference: op.reference,
          title: op.title,
          status: op.status,
          priority: op.priority,
          assignedUserId: op.assignedUserId,
          dueAt: op.dueAt ? new Date(op.dueAt).toISOString() : null,
          reason: `Operation is in status "${op.status}"`,
        }));

        return {
          queryType,
          queryText,
          supported: true,
          message: `Found ${data.length} open operation(s).`,
          data,
        };
      }

      case 'URGENT_WITHOUT_ASSIGNEE': {
        const matches = openOps.filter(
          (op) =>
            (op.priority === 'HIGH' || op.priority === 'URGENT') &&
            !op.assignedUserId,
        );

        const data = matches.map((op) => ({
          operationId: op.id,
          reference: op.reference,
          title: op.title,
          status: op.status,
          priority: op.priority,
          assignedUserId: null,
          dueAt: op.dueAt ? new Date(op.dueAt).toISOString() : null,
          reason: `Priority "${op.priority}" but no user assigned`,
        }));

        return {
          queryType,
          queryText,
          supported: true,
          message: `Found ${data.length} urgent unassigned operation(s).`,
          data,
        };
      }

      case 'OVERDUE_OPERATIONS': {
        const now = new Date();
        const matches = openOps.filter(
          (op) => op.dueAt && new Date(op.dueAt) < now,
        );

        const data = matches.map((op) => ({
          operationId: op.id,
          reference: op.reference,
          title: op.title,
          status: op.status,
          priority: op.priority,
          assignedUserId: op.assignedUserId,
          dueAt: op.dueAt ? new Date(op.dueAt).toISOString() : null,
          reason: `Due date was ${new Date(op.dueAt!).toLocaleDateString()} and operation is still open`,
        }));

        return {
          queryType,
          queryText,
          supported: true,
          message: `Found ${data.length} overdue operation(s).`,
          data,
        };
      }
    }
  }
}
