import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
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
import { OperationChargesService } from './operation-charges.service.js';
import { CreateOperationChargeDto } from './dto/create-operation-charge.dto.js';
import { UpdateOperationChargeDto } from './dto/update-operation-charge.dto.js';
import { ListOperationChargesDto } from './dto/list-operation-charges.dto.js';

@Controller('operations/:operationId/charges')
@UseGuards(AuthGuard, PermissionsGuard)
export class OperationChargesController {
  constructor(private readonly chargesService: OperationChargesService) {}

  @Get()
  @RequirePermission(PERMISSION.FINANCE_READ)
  async list(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
    @Query() query: ListOperationChargesDto,
  ) {
    return this.chargesService.list(operationId, organizationId, query);
  }

  @Post()
  @RequirePermission(PERMISSION.FINANCE_CREATE_CHARGE)
  async create(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
    @Body() dto: CreateOperationChargeDto,
    @Session() session: ActiveSession,
  ) {
    return this.chargesService.create(operationId, organizationId, dto, session.user.id);
  }

  @Patch(':chargeId')
  @RequirePermission(PERMISSION.FINANCE_UPDATE_CHARGE)
  async update(
    @Headers('x-organization-id') organizationId: string,
    @Param('chargeId') chargeId: string,
    @Body() dto: UpdateOperationChargeDto,
    @Session() session: ActiveSession,
  ) {
    return this.chargesService.update(chargeId, organizationId, dto, session.user.id);
  }

  @Delete(':chargeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION.FINANCE_DELETE_CHARGE)
  async deactivate(
    @Headers('x-organization-id') organizationId: string,
    @Param('chargeId') chargeId: string,
    @Session() session: ActiveSession,
  ) {
    await this.chargesService.deactivate(chargeId, organizationId, session.user.id);
  }
}
