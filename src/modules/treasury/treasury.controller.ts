import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Session } from '../../common/decorators/session.decorator.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { TreasuryService } from './treasury.service.js';
import { CreateBankAccountDto } from './dto/create-bank-account.dto.js';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto.js';
import { CreateFundMovementDto } from './dto/create-fund-movement.dto.js';
import { SearchMovementsDto } from './dto/search-movements.dto.js';
import { ListMovementsDto } from './dto/list-movements.dto.js';

@Controller('treasury')
@UseGuards(AuthGuard, PermissionsGuard)
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  // ========== Bank Accounts ==========

  @Get('bank-accounts')
  @RequirePermission(PERMISSION.BANK_ACCOUNTS_READ)
  async listBankAccounts(@Headers('x-organization-id') organizationId: string) {
    return this.treasuryService.listBankAccounts(organizationId);
  }

  @Get('bank-accounts/:id')
  @RequirePermission(PERMISSION.BANK_ACCOUNTS_READ)
  async getBankAccount(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.treasuryService.getBankAccountById(id, organizationId);
  }

  @Get('bank-accounts/:id/movements')
  @RequirePermission(PERMISSION.FUND_MOVEMENTS_READ)
  async getBankAccountMovements(
    @Param('id') id: string,
    @Query() dto: ListMovementsDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.treasuryService.getBankAccountMovements(
      id,
      organizationId,
      limit,
      offset,
    );
  }

  @Post('bank-accounts')
  @RequirePermission(PERMISSION.BANK_ACCOUNTS_CREATE)
  async createBankAccount(
    @Body() dto: CreateBankAccountDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.treasuryService.createBankAccount(
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Patch('bank-accounts/:id')
  @RequirePermission(PERMISSION.BANK_ACCOUNTS_UPDATE)
  async updateBankAccount(
    @Param('id') id: string,
    @Body() dto: UpdateBankAccountDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.treasuryService.updateBankAccount(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete('bank-accounts/:id')
  @RequirePermission(PERMISSION.BANK_ACCOUNTS_DELETE)
  async deleteBankAccount(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.treasuryService.deleteBankAccount(
      id,
      session.user.id,
      organizationId,
    );
    return { deleted: true };
  }

  // ========== Fund Movements ==========

  @Get('movements')
  @RequirePermission(PERMISSION.FUND_MOVEMENTS_READ)
  async listMovements(
    @Query() dto: ListMovementsDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.treasuryService.listMovements(organizationId, limit, offset);
  }

  @Get('movements/search')
  @RequirePermission(PERMISSION.FUND_MOVEMENTS_SEARCH)
  async searchMovements(
    @Query() dto: SearchMovementsDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.treasuryService.searchMovements(
      organizationId,
      dto.q,
      limit,
      offset,
    );
  }

  @Get('movements/:id')
  @RequirePermission(PERMISSION.FUND_MOVEMENTS_READ)
  async getMovement(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.treasuryService.getMovementById(id, organizationId);
  }

  @Post('movements')
  @RequirePermission(PERMISSION.FUND_MOVEMENTS_CREATE)
  async createMovement(
    @Body() dto: CreateFundMovementDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.treasuryService.createMovement(
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Post('movements/:id/confirm')
  @RequirePermission(PERMISSION.FUND_MOVEMENTS_CONFIRM)
  async confirmMovement(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.treasuryService.confirmMovement(
      id,
      session.user.id,
      organizationId,
    );
  }

  @Post('movements/:id/reconcile')
  @RequirePermission(PERMISSION.FUND_MOVEMENTS_RECONCILE)
  async reconcileMovement(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.treasuryService.reconcileMovement(
      id,
      session.user.id,
      organizationId,
    );
  }

  @Post('movements/:id/cancel')
  @RequirePermission(PERMISSION.FUND_MOVEMENTS_CANCEL)
  async cancelMovement(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.treasuryService.cancelMovement(
      id,
      session.user.id,
      organizationId,
    );
  }

  // ========== Client Balances ==========

  @Get('client-balances')
  @RequirePermission(PERMISSION.CLIENT_BALANCES_READ)
  async listClientBalances(
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.treasuryService.listClientBalances(organizationId);
  }

  @Get('client-balances/:clientId')
  @RequirePermission(PERMISSION.CLIENT_BALANCES_READ)
  async getClientBalance(
    @Param('clientId') clientId: string,
    @Query('currency') currency: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.treasuryService.getClientBalance(
      organizationId,
      clientId,
      currency ?? 'MXN',
    );
  }
}
