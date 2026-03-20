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
import { BillingService } from './billing.service.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import { UpdateInvoiceDto } from './dto/update-invoice.dto.js';
import { AddInvoiceItemDto } from './dto/add-invoice-item.dto.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { CreateExpenseAccountDto } from './dto/create-expense-account.dto.js';
import { UpdateExpenseAccountDto } from './dto/update-expense-account.dto.js';
import { AddExpenseAccountItemDto } from './dto/add-expense-account-item.dto.js';
import { ChangeExpenseAccountStatusDto } from './dto/change-expense-account-status.dto.js';
import { SearchInvoicesDto } from './dto/search-invoices.dto.js';
import { ListInvoicesDto } from './dto/list-invoices.dto.js';

@Controller('billing')
@UseGuards(AuthGuard, PermissionsGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // ========== Invoices ==========

  @Get('invoices')
  @RequirePermission(PERMISSION.INVOICES_READ)
  async listInvoices(
    @Query() dto: ListInvoicesDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.billingService.listInvoices(organizationId, limit, offset);
  }

  @Get('invoices/search')
  @RequirePermission(PERMISSION.INVOICES_SEARCH)
  async searchInvoices(
    @Query() dto: SearchInvoicesDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.billingService.searchInvoices(
      organizationId,
      dto.q,
      limit,
      offset,
    );
  }

  @Get('invoices/:id')
  @RequirePermission(PERMISSION.INVOICES_READ)
  async getInvoice(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.billingService.getInvoiceById(id, organizationId);
  }

  @Get('invoices/:id/details')
  @RequirePermission(PERMISSION.INVOICES_READ)
  async getInvoiceDetails(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.billingService.getInvoiceDetails(id, organizationId);
  }

  @Post('invoices')
  @RequirePermission(PERMISSION.INVOICES_CREATE)
  async createInvoice(
    @Body() dto: CreateInvoiceDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.billingService.createInvoice(
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Patch('invoices/:id')
  @RequirePermission(PERMISSION.INVOICES_UPDATE)
  async updateInvoice(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.billingService.updateInvoice(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete('invoices/:id')
  @RequirePermission(PERMISSION.INVOICES_DELETE)
  async deleteInvoice(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.billingService.deleteInvoice(
      id,
      session.user.id,
      organizationId,
    );
    return { deleted: true };
  }

  @Post('invoices/:id/issue')
  @RequirePermission(PERMISSION.INVOICES_ISSUE)
  async issueInvoice(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.billingService.issueInvoice(
      id,
      session.user.id,
      organizationId,
    );
  }

  @Post('invoices/:id/cancel')
  @RequirePermission(PERMISSION.INVOICES_CANCEL)
  async cancelInvoice(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.billingService.cancelInvoice(
      id,
      reason,
      session.user.id,
      organizationId,
    );
  }

  // --- Invoice Items ---

  @Get('invoices/:id/items')
  @RequirePermission(PERMISSION.INVOICES_READ)
  async listInvoiceItems(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.billingService.listInvoiceItems(id, organizationId);
  }

  @Post('invoices/:id/items')
  @RequirePermission(PERMISSION.INVOICES_UPDATE)
  async addInvoiceItem(
    @Param('id') id: string,
    @Body() dto: AddInvoiceItemDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.billingService.addInvoiceItem(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete('invoices/:id/items/:itemId')
  @RequirePermission(PERMISSION.INVOICES_UPDATE)
  async removeInvoiceItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.billingService.removeInvoiceItem(
      id,
      itemId,
      session.user.id,
      organizationId,
    );
    return { deleted: true };
  }

  // ========== Payments ==========

  @Get('payments')
  @RequirePermission(PERMISSION.PAYMENTS_READ)
  async listPayments(
    @Query() dto: ListInvoicesDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.billingService.listPayments(organizationId, limit, offset);
  }

  @Get('invoices/:id/payments')
  @RequirePermission(PERMISSION.PAYMENTS_READ)
  async listInvoicePayments(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.billingService.listPaymentsByInvoice(id, organizationId);
  }

  @Post('payments')
  @RequirePermission(PERMISSION.PAYMENTS_CREATE)
  async createPayment(
    @Body() dto: CreatePaymentDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.billingService.createPayment(
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Post('payments/:id/confirm')
  @RequirePermission(PERMISSION.PAYMENTS_CONFIRM)
  async confirmPayment(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.billingService.confirmPayment(
      id,
      session.user.id,
      organizationId,
    );
  }

  @Post('payments/:id/cancel')
  @RequirePermission(PERMISSION.PAYMENTS_CANCEL)
  async cancelPayment(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.billingService.cancelPayment(
      id,
      session.user.id,
      organizationId,
    );
  }

  // ========== Expense Accounts ==========

  @Get('expense-accounts')
  @RequirePermission(PERMISSION.EXPENSE_ACCOUNTS_READ)
  async listExpenseAccounts(
    @Query() dto: ListInvoicesDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.billingService.listExpenseAccounts(
      organizationId,
      limit,
      offset,
    );
  }

  @Get('expense-accounts/search')
  @RequirePermission(PERMISSION.EXPENSE_ACCOUNTS_SEARCH)
  async searchExpenseAccounts(
    @Query() dto: SearchInvoicesDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.billingService.searchExpenseAccounts(
      organizationId,
      dto.q,
      limit,
      offset,
    );
  }

  @Get('expense-accounts/:id')
  @RequirePermission(PERMISSION.EXPENSE_ACCOUNTS_READ)
  async getExpenseAccount(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.billingService.getExpenseAccountById(id, organizationId);
  }

  @Get('expense-accounts/:id/details')
  @RequirePermission(PERMISSION.EXPENSE_ACCOUNTS_READ)
  async getExpenseAccountDetails(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.billingService.getExpenseAccountDetails(id, organizationId);
  }

  @Post('expense-accounts')
  @RequirePermission(PERMISSION.EXPENSE_ACCOUNTS_CREATE)
  async createExpenseAccount(
    @Body() dto: CreateExpenseAccountDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.billingService.createExpenseAccount(
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Patch('expense-accounts/:id')
  @RequirePermission(PERMISSION.EXPENSE_ACCOUNTS_UPDATE)
  async updateExpenseAccount(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseAccountDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.billingService.updateExpenseAccount(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete('expense-accounts/:id')
  @RequirePermission(PERMISSION.EXPENSE_ACCOUNTS_DELETE)
  async deleteExpenseAccount(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.billingService.deleteExpenseAccount(
      id,
      session.user.id,
      organizationId,
    );
    return { deleted: true };
  }

  @Post('expense-accounts/:id/status')
  @RequirePermission(PERMISSION.EXPENSE_ACCOUNTS_UPDATE)
  async changeExpenseAccountStatus(
    @Param('id') id: string,
    @Body() dto: ChangeExpenseAccountStatusDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.billingService.changeExpenseAccountStatus(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  // --- Expense Account Items ---

  @Get('expense-accounts/:id/items')
  @RequirePermission(PERMISSION.EXPENSE_ACCOUNTS_READ)
  async listExpenseAccountItems(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.billingService.listExpenseAccountItems(id, organizationId);
  }

  @Post('expense-accounts/:id/items')
  @RequirePermission(PERMISSION.EXPENSE_ACCOUNTS_UPDATE)
  async addExpenseAccountItem(
    @Param('id') id: string,
    @Body() dto: AddExpenseAccountItemDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.billingService.addExpenseAccountItem(
      id,
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Delete('expense-accounts/:id/items/:itemId')
  @RequirePermission(PERMISSION.EXPENSE_ACCOUNTS_UPDATE)
  async removeExpenseAccountItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.billingService.removeExpenseAccountItem(
      id,
      itemId,
      session.user.id,
      organizationId,
    );
    return { deleted: true };
  }
}
