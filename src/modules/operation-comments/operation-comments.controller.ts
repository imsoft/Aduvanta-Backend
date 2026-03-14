import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Session } from '../../common/decorators/session.decorator.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { OperationCommentsService } from './operation-comments.service.js';
import { CreateOperationCommentDto } from './dto/create-operation-comment.dto.js';

@Controller('operations/:operationId/comments')
@UseGuards(AuthGuard, PermissionsGuard)
export class OperationCommentsController {
  constructor(private readonly commentsService: OperationCommentsService) {}

  @Get()
  @RequirePermission(PERMISSION.OPERATIONS_READ)
  async list(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
  ) {
    return this.commentsService.list(operationId, organizationId);
  }

  @Post()
  @RequirePermission(PERMISSION.OPERATIONS_COMMENT)
  async create(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
    @Body() dto: CreateOperationCommentDto,
    @Session() session: ActiveSession,
  ) {
    return this.commentsService.create(
      operationId,
      organizationId,
      dto,
      session.user.id,
    );
  }
}
