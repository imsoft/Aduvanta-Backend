import {
  Body,
  Controller,
  Delete,
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
import { ClientPortalAccessService } from './client-portal-access.service.js';
import { GrantPortalAccessDto } from './dto/grant-portal-access.dto.js';
import { ListPortalAccessDto } from './dto/list-portal-access.dto.js';

@Controller('client-portal-access')
@UseGuards(AuthGuard, PermissionsGuard)
export class ClientPortalAccessController {
  constructor(
    private readonly portalAccessService: ClientPortalAccessService,
  ) {}

  @Get()
  @RequirePermission(PERMISSION.PORTAL_ACCESS_MANAGE)
  async list(
    @Headers('x-organization-id') organizationId: string,
    @Query() query: ListPortalAccessDto,
  ) {
    if (query.clientId) {
      return this.portalAccessService.listForClient(
        query.clientId,
        organizationId,
      );
    }
    return [];
  }

  @Post()
  @RequirePermission(PERMISSION.PORTAL_ACCESS_MANAGE)
  async grant(
    @Headers('x-organization-id') organizationId: string,
    @Body() dto: GrantPortalAccessDto,
    @Session() session: ActiveSession,
  ) {
    return this.portalAccessService.grant(organizationId, dto, session.user.id);
  }

  @Delete(':accessId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION.PORTAL_ACCESS_MANAGE)
  async revoke(
    @Headers('x-organization-id') organizationId: string,
    @Param('accessId') accessId: string,
    @Session() session: ActiveSession,
  ) {
    await this.portalAccessService.revoke(
      accessId,
      organizationId,
      session.user.id,
    );
  }
}
