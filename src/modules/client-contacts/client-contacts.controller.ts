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
import { ClientContactsService } from './client-contacts.service.js';
import { CreateClientContactDto } from './dto/create-client-contact.dto.js';
import { UpdateClientContactDto } from './dto/update-client-contact.dto.js';

@Controller('clients/:clientId/contacts')
@UseGuards(AuthGuard, PermissionsGuard)
export class ClientContactsController {
  constructor(private readonly contactsService: ClientContactsService) {}

  @Get()
  @RequirePermission(PERMISSION.CLIENT_CONTACTS_READ)
  async list(
    @Headers('x-organization-id') organizationId: string,
    @Param('clientId') clientId: string,
  ) {
    return this.contactsService.list(clientId, organizationId);
  }

  @Post()
  @RequirePermission(PERMISSION.CLIENT_CONTACTS_CREATE)
  async create(
    @Headers('x-organization-id') organizationId: string,
    @Param('clientId') clientId: string,
    @Body() dto: CreateClientContactDto,
    @Session() session: ActiveSession,
  ) {
    return this.contactsService.create(
      clientId,
      organizationId,
      dto,
      session.user.id,
    );
  }

  @Patch(':contactId')
  @RequirePermission(PERMISSION.CLIENT_CONTACTS_UPDATE)
  async update(
    @Headers('x-organization-id') organizationId: string,
    @Param('clientId') clientId: string,
    @Param('contactId') contactId: string,
    @Body() dto: UpdateClientContactDto,
    @Session() session: ActiveSession,
  ) {
    return this.contactsService.update(
      clientId,
      contactId,
      organizationId,
      dto,
      session.user.id,
    );
  }

  @Delete(':contactId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION.CLIENT_CONTACTS_DELETE)
  async remove(
    @Headers('x-organization-id') organizationId: string,
    @Param('clientId') clientId: string,
    @Param('contactId') contactId: string,
    @Session() session: ActiveSession,
  ) {
    await this.contactsService.remove(
      clientId,
      contactId,
      organizationId,
      session.user.id,
    );
  }
}
