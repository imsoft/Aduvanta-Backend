import {
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
import { OperationFinanceService } from './operation-finance.service.js';

@Controller('operations/:operationId')
@UseGuards(AuthGuard, PermissionsGuard)
export class OperationFinanceController {
  constructor(private readonly financeService: OperationFinanceService) {}

  @Get('finance-summary')
  @RequirePermission(PERMISSION.FINANCE_READ)
  async getSummary(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
  ) {
    return this.financeService.getSummary(operationId, organizationId);
  }

  @Post('expense-account')
  @RequirePermission(PERMISSION.FINANCE_GENERATE_EXPENSE_ACCOUNT)
  async generateExpenseAccount(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
    @Session() session: ActiveSession,
  ) {
    return this.financeService.generateExpenseAccount(
      operationId,
      organizationId,
      session.user.id,
    );
  }
}
