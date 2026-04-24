import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { IsOptional, IsInt, IsString, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { Session } from '../../common/decorators/session.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { ClientAccountsService } from './client-accounts.service.js';
import { CreateAccountMovementDto } from './dto/create-movement.dto.js';
import { GenerateStatementDto } from './dto/generate-statement.dto.js';

class ListMovementsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

@Controller('client-accounts')
@UseGuards(AuthGuard, PermissionsGuard)
export class ClientAccountsController {
  constructor(private readonly service: ClientAccountsService) {}

  @Get('balances')
  @RequirePermission(PERMISSION.CLIENT_ACCOUNTS_READ)
  async getAllBalances(
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getAllClientBalances(organizationId);
  }

  @Get('funds')
  @RequirePermission(PERMISSION.CLIENT_ACCOUNTS_READ)
  async getAllFunds(
    @Query() dto: { q?: string; limit?: number; offset?: number },
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 100;
    const offset = dto.offset ?? 0;
    return this.service.getAllClientFunds(organizationId, dto.q, limit, offset);
  }

  @Get(':clientId/balance')
  @RequirePermission(PERMISSION.CLIENT_ACCOUNTS_READ)
  async getBalance(
    @Param('clientId') clientId: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getClientBalance(clientId, organizationId);
  }

  @Get(':clientId/movements')
  @RequirePermission(PERMISSION.CLIENT_ACCOUNTS_READ)
  async listMovements(
    @Param('clientId') clientId: string,
    @Query() dto: ListMovementsDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 50;
    const offset = dto.offset ?? 0;
    return this.service.listMovements(
      clientId,
      organizationId,
      limit,
      offset,
      dto.dateFrom,
      dto.dateTo,
    );
  }

  @Post('movements')
  @RequirePermission(PERMISSION.CLIENT_ACCOUNTS_WRITE)
  async recordMovement(
    @Body() dto: CreateAccountMovementDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.recordMovement(dto, session.user.id, organizationId);
  }

  @Get(':clientId/statements')
  @RequirePermission(PERMISSION.CLIENT_ACCOUNTS_READ)
  async listStatements(
    @Param('clientId') clientId: string,
    @Query() dto: { limit?: number; offset?: number },
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    return this.service.listStatements(clientId, organizationId, limit, offset);
  }

  @Post('statements')
  @RequirePermission(PERMISSION.CLIENT_ACCOUNTS_WRITE)
  async generateStatement(
    @Body() dto: GenerateStatementDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.generateStatement(
      dto,
      session.user.id,
      organizationId,
    );
  }
}
