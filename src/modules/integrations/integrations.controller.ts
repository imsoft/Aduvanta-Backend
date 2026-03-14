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
import { IntegrationsService } from './integrations.service.js';
import { CreateIntegrationDto } from './dto/create-integration.dto.js';
import { UpdateIntegrationDto } from './dto/update-integration.dto.js';
import { ListIntegrationsDto } from './dto/list-integrations.dto.js';

@Controller('integrations')
@UseGuards(AuthGuard, PermissionsGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @RequirePermission(PERMISSION.INTEGRATIONS_READ)
  async list(
    @Headers('x-organization-id') organizationId: string,
    @Query() query: ListIntegrationsDto,
  ) {
    return this.integrationsService.list(organizationId, query);
  }

  @Post()
  @RequirePermission(PERMISSION.INTEGRATIONS_MANAGE)
  async create(
    @Headers('x-organization-id') organizationId: string,
    @Body() dto: CreateIntegrationDto,
    @Session() session: ActiveSession,
  ) {
    return this.integrationsService.create(organizationId, dto, session.user.id);
  }

  @Get(':integrationId')
  @RequirePermission(PERMISSION.INTEGRATIONS_READ)
  async getById(
    @Headers('x-organization-id') organizationId: string,
    @Param('integrationId') integrationId: string,
  ) {
    return this.integrationsService.getById(integrationId, organizationId);
  }

  @Patch(':integrationId')
  @RequirePermission(PERMISSION.INTEGRATIONS_MANAGE)
  async update(
    @Headers('x-organization-id') organizationId: string,
    @Param('integrationId') integrationId: string,
    @Body() dto: UpdateIntegrationDto,
    @Session() session: ActiveSession,
  ) {
    return this.integrationsService.update(integrationId, organizationId, dto, session.user.id);
  }

  @Delete(':integrationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION.INTEGRATIONS_MANAGE)
  async deactivate(
    @Headers('x-organization-id') organizationId: string,
    @Param('integrationId') integrationId: string,
    @Session() session: ActiveSession,
  ) {
    await this.integrationsService.deactivate(integrationId, organizationId, session.user.id);
  }
}
