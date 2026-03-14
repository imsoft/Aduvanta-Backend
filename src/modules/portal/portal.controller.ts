import {
  Controller,
  Get,
  Headers,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Session } from '../../common/decorators/session.decorator.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { PortalService } from './portal.service.js';
import { ListPortalOperationsDto } from './dto/list-portal-operations.dto.js';

@Controller('portal')
@UseGuards(AuthGuard, PermissionsGuard)
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('operations')
  @RequirePermission(PERMISSION.PORTAL_OPERATIONS_READ)
  async listOperations(
    @Headers('x-organization-id') organizationId: string,
    @Query() query: ListPortalOperationsDto,
    @Session() session: ActiveSession,
  ) {
    return this.portalService.listOperations(session.user.id, organizationId, query);
  }

  @Get('operations/:operationId')
  @RequirePermission(PERMISSION.PORTAL_OPERATIONS_READ)
  async getOperation(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
    @Session() session: ActiveSession,
  ) {
    return this.portalService.getOperation(operationId, session.user.id, organizationId);
  }

  @Get('operations/:operationId/history')
  @RequirePermission(PERMISSION.PORTAL_OPERATIONS_READ)
  async getStatusHistory(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
    @Session() session: ActiveSession,
  ) {
    return this.portalService.getStatusHistory(operationId, session.user.id, organizationId);
  }

  @Get('operations/:operationId/comments')
  @RequirePermission(PERMISSION.PORTAL_COMMENTS_READ)
  async listComments(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
    @Session() session: ActiveSession,
  ) {
    return this.portalService.listComments(operationId, session.user.id, organizationId);
  }

  @Get('operations/:operationId/documents')
  @RequirePermission(PERMISSION.PORTAL_DOCUMENTS_READ)
  async listDocuments(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
    @Session() session: ActiveSession,
  ) {
    return this.portalService.listDocuments(operationId, session.user.id, organizationId);
  }

  @Get('documents/:documentId/download-url')
  @RequirePermission(PERMISSION.PORTAL_DOCUMENTS_DOWNLOAD)
  async getDocumentDownloadUrl(
    @Headers('x-organization-id') organizationId: string,
    @Param('documentId') documentId: string,
    @Session() session: ActiveSession,
  ) {
    return this.portalService.getDocumentDownloadUrl(
      documentId,
      session.user.id,
      organizationId,
    );
  }
}
