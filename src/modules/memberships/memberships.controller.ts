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
import { InviteMemberDto } from './dto/invite-member.dto.js';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto.js';
import { MembershipsService } from './memberships.service.js';

@Controller('memberships')
@UseGuards(AuthGuard, PermissionsGuard)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get()
  @RequirePermission(PERMISSION.MEMBERS_READ)
  async list(@Headers('x-organization-id') organizationId: string) {
    return this.membershipsService.listMembers(organizationId);
  }

  @Post()
  @RequirePermission(PERMISSION.MEMBERS_INVITE)
  async invite(
    @Headers('x-organization-id') organizationId: string,
    @Body() dto: InviteMemberDto,
    @Session() session: ActiveSession,
  ) {
    return this.membershipsService.addMember(
      organizationId,
      dto.email,
      dto.role,
      session.user.id,
    );
  }

  @Patch(':userId')
  @RequirePermission(PERMISSION.MEMBERS_UPDATE_ROLE)
  async updateRole(
    @Headers('x-organization-id') organizationId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
    @Session() session: ActiveSession,
  ) {
    return this.membershipsService.updateMemberRole(
      organizationId,
      userId,
      dto.role,
      session.user.id,
    );
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION.MEMBERS_REMOVE)
  async remove(
    @Headers('x-organization-id') organizationId: string,
    @Param('userId') userId: string,
    @Session() session: ActiveSession,
  ) {
    await this.membershipsService.removeMember(
      organizationId,
      userId,
      session.user.id,
    );
  }
}
