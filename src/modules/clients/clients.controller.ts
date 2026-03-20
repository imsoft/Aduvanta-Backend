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
import { ClientsService } from './clients.service.js';
import { CreateClientDto } from './dto/create-client.dto.js';
import { UpdateClientDto } from './dto/update-client.dto.js';
import { ListClientsDto } from './dto/list-clients.dto.js';

@Controller('clients')
@UseGuards(AuthGuard, PermissionsGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @RequirePermission(PERMISSION.CLIENTS_READ)
  async list(
    @Headers('x-organization-id') organizationId: string,
    @Query() query: ListClientsDto,
  ) {
    return this.clientsService.list(organizationId, query);
  }

  @Post()
  @RequirePermission(PERMISSION.CLIENTS_CREATE)
  async create(
    @Headers('x-organization-id') organizationId: string,
    @Body() dto: CreateClientDto,
    @Session() session: ActiveSession,
  ) {
    return this.clientsService.create(organizationId, dto, session.user.id);
  }

  @Get(':clientId')
  @RequirePermission(PERMISSION.CLIENTS_READ)
  async getById(
    @Headers('x-organization-id') organizationId: string,
    @Param('clientId') clientId: string,
  ) {
    return this.clientsService.getById(clientId, organizationId);
  }

  @Patch(':clientId')
  @RequirePermission(PERMISSION.CLIENTS_UPDATE)
  async update(
    @Headers('x-organization-id') organizationId: string,
    @Param('clientId') clientId: string,
    @Body() dto: UpdateClientDto,
    @Session() session: ActiveSession,
  ) {
    return this.clientsService.update(
      clientId,
      organizationId,
      dto,
      session.user.id,
    );
  }

  @Delete(':clientId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION.CLIENTS_DELETE)
  async deactivate(
    @Headers('x-organization-id') organizationId: string,
    @Param('clientId') clientId: string,
    @Session() session: ActiveSession,
  ) {
    await this.clientsService.deactivate(
      clientId,
      organizationId,
      session.user.id,
    );
  }
}
