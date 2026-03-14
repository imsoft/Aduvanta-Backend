import { Injectable } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import { OperationsService } from '../operations/operations.service.js';
import type { OperationCommentRecord } from './operation-comments.repository.js';
import { OperationCommentsRepository } from './operation-comments.repository.js';
import type { CreateOperationCommentDto } from './dto/create-operation-comment.dto.js';

@Injectable()
export class OperationCommentsService {
  constructor(
    private readonly commentsRepository: OperationCommentsRepository,
    private readonly operationsService: OperationsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async list(
    operationId: string,
    organizationId: string,
  ): Promise<OperationCommentRecord[]> {
    // Validates operation belongs to the organization.
    await this.operationsService.getById(operationId, organizationId);
    return this.commentsRepository.findByOperation(operationId, organizationId);
  }

  async create(
    operationId: string,
    organizationId: string,
    dto: CreateOperationCommentDto,
    actorId: string,
  ): Promise<OperationCommentRecord> {
    await this.operationsService.getById(operationId, organizationId);

    const comment = await this.commentsRepository.insert({
      organizationId,
      operationId,
      authorId: actorId,
      body: dto.body,
      isClientVisible: dto.isClientVisible ?? false,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.OPERATION_COMMENT_ADDED,
      resource: 'operation_comment',
      resourceId: comment.id,
      metadata: { operationId },
    });

    return comment;
  }
}
