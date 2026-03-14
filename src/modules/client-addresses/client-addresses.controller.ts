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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Session } from '../../common/decorators/session.decorator.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { ClientAddressesService } from './client-addresses.service.js';
import { CreateClientAddressDto } from './dto/create-client-address.dto.js';
import { UpdateClientAddressDto } from './dto/update-client-address.dto.js';

@Controller('clients/:clientId/addresses')
@UseGuards(AuthGuard, PermissionsGuard)
export class ClientAddressesController {
  constructor(private readonly addressesService: ClientAddressesService) {}

  @Get()
  @RequirePermission(PERMISSION.CLIENT_ADDRESSES_READ)
  async list(
    @Headers('x-organization-id') organizationId: string,
    @Param('clientId') clientId: string,
  ) {
    return this.addressesService.list(clientId, organizationId);
  }

  @Post()
  @RequirePermission(PERMISSION.CLIENT_ADDRESSES_CREATE)
  async create(
    @Headers('x-organization-id') organizationId: string,
    @Param('clientId') clientId: string,
    @Body() dto: CreateClientAddressDto,
    @Session() session: ActiveSession,
  ) {
    return this.addressesService.create(
      clientId,
      organizationId,
      dto,
      session.user.id,
    );
  }

  @Patch(':addressId')
  @RequirePermission(PERMISSION.CLIENT_ADDRESSES_UPDATE)
  async update(
    @Headers('x-organization-id') organizationId: string,
    @Param('clientId') clientId: string,
    @Param('addressId') addressId: string,
    @Body() dto: UpdateClientAddressDto,
    @Session() session: ActiveSession,
  ) {
    return this.addressesService.update(
      clientId,
      addressId,
      organizationId,
      dto,
      session.user.id,
    );
  }

  @Delete(':addressId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION.CLIENT_ADDRESSES_DELETE)
  async remove(
    @Headers('x-organization-id') organizationId: string,
    @Param('clientId') clientId: string,
    @Param('addressId') addressId: string,
    @Session() session: ActiveSession,
  ) {
    await this.addressesService.remove(
      clientId,
      addressId,
      organizationId,
      session.user.id,
    );
  }
}
