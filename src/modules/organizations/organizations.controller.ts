import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Session } from '../../common/decorators/session.decorator.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { PERMISSION } from '../permissions/permission.codes.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { OrganizationsService } from './organizations.service.js';

@Controller('organizations')
@UseGuards(AuthGuard, PermissionsGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  // Creating an org requires no org context — the user becomes the OWNER on creation.
  @Post()
  async create(
    @Body() dto: CreateOrganizationDto,
    @Session() session: ActiveSession,
  ) {
    return this.organizationsService.create(dto.name, session.user.id);
  }

  // Lists only orgs the user belongs to — no org context needed.
  @Get()
  async list(@Session() session: ActiveSession) {
    return this.organizationsService.listForUser(session.user.id);
  }

  @Get(':id')
  @RequirePermission(PERMISSION.ORGANIZATIONS_READ)
  async getById(@Param('id') id: string, @Session() session: ActiveSession) {
    return this.organizationsService.getById(id, session.user.id);
  }
}
