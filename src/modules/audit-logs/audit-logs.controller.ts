import { Controller, Get, Headers, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { AuditLogsService } from './audit-logs.service.js';
import { ListAuditLogsDto } from './dto/list-audit-logs.dto.js';

@Controller('audit-logs')
@UseGuards(AuthGuard, PermissionsGuard)
@RequirePermission(PERMISSION.AUDIT_LOGS_READ)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  async list(
    @Headers('x-organization-id') organizationId: string,
    @Query() query: ListAuditLogsDto,
  ) {
    return this.auditLogsService.listForOrganization(
      organizationId,
      query.limit,
      query.offset,
    );
  }
}
