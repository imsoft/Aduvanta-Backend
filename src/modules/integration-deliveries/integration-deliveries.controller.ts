import {
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
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
import { IntegrationDeliveriesService } from './integration-deliveries.service.js';
import { ListIntegrationDeliveriesDto } from './dto/list-integration-deliveries.dto.js';

@Controller()
@UseGuards(AuthGuard, PermissionsGuard)
export class IntegrationDeliveriesController {
  constructor(
    private readonly deliveriesService: IntegrationDeliveriesService,
  ) {}

  @Get('integrations/:integrationId/deliveries')
  @RequirePermission(PERMISSION.INTEGRATIONS_LOGS_READ)
  async listForIntegration(
    @Headers('x-organization-id') organizationId: string,
    @Param('integrationId') integrationId: string,
    @Query() query: ListIntegrationDeliveriesDto,
  ) {
    return this.deliveriesService.listForIntegration(
      integrationId,
      organizationId,
      query,
    );
  }

  @Post('integration-deliveries/:deliveryId/retry')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSION.INTEGRATIONS_RUN)
  async retry(
    @Headers('x-organization-id') organizationId: string,
    @Param('deliveryId') deliveryId: string,
    @Session() session: ActiveSession,
  ) {
    return this.deliveriesService.retry(
      deliveryId,
      organizationId,
      session.user.id,
    );
  }
}
