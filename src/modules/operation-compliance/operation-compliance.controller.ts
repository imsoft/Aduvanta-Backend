import { Controller, Get, Headers, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { OperationComplianceService } from './operation-compliance.service.js';

@Controller('operations/:operationId/compliance')
@UseGuards(AuthGuard, PermissionsGuard)
export class OperationComplianceController {
  constructor(private readonly complianceService: OperationComplianceService) {}

  @Get()
  @RequirePermission(PERMISSION.COMPLIANCE_EVALUATE)
  async evaluate(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
  ) {
    return this.complianceService.evaluate(operationId, organizationId);
  }
}
