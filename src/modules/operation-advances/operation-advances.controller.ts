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
import { OperationAdvancesService } from './operation-advances.service.js';
import { CreateOperationAdvanceDto } from './dto/create-operation-advance.dto.js';
import { UpdateOperationAdvanceDto } from './dto/update-operation-advance.dto.js';
import { ListOperationAdvancesDto } from './dto/list-operation-advances.dto.js';

@Controller('operations/:operationId/advances')
@UseGuards(AuthGuard, PermissionsGuard)
export class OperationAdvancesController {
  constructor(private readonly advancesService: OperationAdvancesService) {}

  @Get()
  @RequirePermission(PERMISSION.FINANCE_READ)
  async list(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
    @Query() query: ListOperationAdvancesDto,
  ) {
    return this.advancesService.list(operationId, organizationId, query);
  }

  @Post()
  @RequirePermission(PERMISSION.FINANCE_CREATE_ADVANCE)
  async create(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
    @Body() dto: CreateOperationAdvanceDto,
    @Session() session: ActiveSession,
  ) {
    return this.advancesService.create(
      operationId,
      organizationId,
      dto,
      session.user.id,
    );
  }

  @Patch(':advanceId')
  @RequirePermission(PERMISSION.FINANCE_UPDATE_ADVANCE)
  async update(
    @Headers('x-organization-id') organizationId: string,
    @Param('advanceId') advanceId: string,
    @Body() dto: UpdateOperationAdvanceDto,
    @Session() session: ActiveSession,
  ) {
    return this.advancesService.update(
      advanceId,
      organizationId,
      dto,
      session.user.id,
    );
  }

  @Delete(':advanceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION.FINANCE_DELETE_ADVANCE)
  async deactivate(
    @Headers('x-organization-id') organizationId: string,
    @Param('advanceId') advanceId: string,
    @Session() session: ActiveSession,
  ) {
    await this.advancesService.deactivate(
      advanceId,
      organizationId,
      session.user.id,
    );
  }
}
