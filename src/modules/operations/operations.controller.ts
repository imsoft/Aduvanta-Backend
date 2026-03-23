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
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator.js';
import { Idempotent } from '../../common/idempotency/idempotency.decorator.js';
import { RateLimitGuard } from '../../common/rate-limit/rate-limit.guard.js';
import { IdempotencyGuard } from '../../common/idempotency/idempotency.guard.js';
import { AbuseDetectionGuard } from '../../common/abuse-detection/abuse-detection.guard.js';
import { OperationsService } from './operations.service.js';
import { CreateOperationDto } from './dto/create-operation.dto.js';
import { UpdateOperationDto } from './dto/update-operation.dto.js';
import { ListOperationsDto } from './dto/list-operations.dto.js';
import { ChangeOperationStatusDto } from './dto/change-operation-status.dto.js';
import { AssignOperationDto } from './dto/assign-operation.dto.js';

@RateLimit('mutation')
@Controller('operations')
@UseGuards(
  AuthGuard,
  AbuseDetectionGuard,
  RateLimitGuard,
  IdempotencyGuard,
  PermissionsGuard,
)
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get()
  @RequirePermission(PERMISSION.OPERATIONS_READ)
  async list(
    @Headers('x-organization-id') organizationId: string,
    @Query() query: ListOperationsDto,
  ) {
    return this.operationsService.list(organizationId, query);
  }

  @Post()
  @Idempotent(10000)
  @RequirePermission(PERMISSION.OPERATIONS_CREATE)
  async create(
    @Headers('x-organization-id') organizationId: string,
    @Body() dto: CreateOperationDto,
    @Session() session: ActiveSession,
  ) {
    return this.operationsService.create(organizationId, dto, session.user.id);
  }

  @Get(':operationId')
  @RequirePermission(PERMISSION.OPERATIONS_READ)
  async getById(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
  ) {
    return this.operationsService.getById(operationId, organizationId);
  }

  @Patch(':operationId')
  @RequirePermission(PERMISSION.OPERATIONS_UPDATE)
  async update(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
    @Body() dto: UpdateOperationDto,
    @Session() session: ActiveSession,
  ) {
    return this.operationsService.update(
      operationId,
      organizationId,
      dto,
      session.user.id,
    );
  }

  @Delete(':operationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION.OPERATIONS_DELETE)
  async deactivate(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
    @Session() session: ActiveSession,
  ) {
    await this.operationsService.deactivate(
      operationId,
      organizationId,
      session.user.id,
    );
  }

  @Post(':operationId/status')
  @RequirePermission(PERMISSION.OPERATIONS_CHANGE_STATUS)
  async changeStatus(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
    @Body() dto: ChangeOperationStatusDto,
    @Session() session: ActiveSession,
  ) {
    return this.operationsService.changeStatus(
      operationId,
      organizationId,
      dto,
      session.user.id,
    );
  }

  @Post(':operationId/assign')
  @RequirePermission(PERMISSION.OPERATIONS_ASSIGN)
  async assign(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
    @Body() dto: AssignOperationDto,
    @Session() session: ActiveSession,
  ) {
    return this.operationsService.assign(
      operationId,
      organizationId,
      dto,
      session.user.id,
    );
  }

  @Get(':operationId/history')
  @RequirePermission(PERMISSION.OPERATION_HISTORY_READ)
  async getHistory(
    @Headers('x-organization-id') organizationId: string,
    @Param('operationId') operationId: string,
  ) {
    return this.operationsService.getStatusHistory(operationId, organizationId);
  }
}
