import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { SystemAdminGuard } from '../../common/guards/system-admin.guard.js';
import { Session } from '../../common/decorators/session.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { SystemAdminService } from './system-admin.service.js';

@Controller('system-admin')
@UseGuards(AuthGuard)
export class SystemAdminController {
  constructor(private readonly service: SystemAdminService) {}

  // Any authenticated user can check their own admin status
  @Get('me')
  async getMyStatus(@Session() session: ActiveSession) {
    return { isSystemAdmin: session.isSystemAdmin };
  }

  @Get('overview')
  @UseGuards(SystemAdminGuard)
  async getOverview() {
    return this.service.getPlatformOverview();
  }

  @Get('organizations')
  @UseGuards(SystemAdminGuard)
  async listOrganizations(
    @Query('limit') limit = '25',
    @Query('offset') offset = '0',
  ) {
    return this.service.listAllOrganizations(
      parseInt(limit),
      parseInt(offset),
    );
  }

  @Get('users')
  @UseGuards(SystemAdminGuard)
  async listUsers(
    @Query('limit') limit = '25',
    @Query('offset') offset = '0',
    @Query('search') search?: string,
  ) {
    return this.service.listAllUsers(
      parseInt(limit),
      parseInt(offset),
      search,
    );
  }

  @Get('entries')
  @UseGuards(SystemAdminGuard)
  async listEntries(
    @Query('limit') limit = '25',
    @Query('offset') offset = '0',
    @Query('search') search?: string,
  ) {
    return this.service.listAllEntries(parseInt(limit), parseInt(offset), search);
  }

  @Get('operations')
  @UseGuards(SystemAdminGuard)
  async listOperations(
    @Query('limit') limit = '25',
    @Query('offset') offset = '0',
  ) {
    return this.service.listAllOperations(parseInt(limit), parseInt(offset));
  }

  @Get('audit-logs')
  @UseGuards(SystemAdminGuard)
  async listAuditLogs(
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.service.listAllAuditLogs(parseInt(limit), parseInt(offset));
  }

  @Get('feature-flags')
  @UseGuards(SystemAdminGuard)
  async listFeatureFlags() {
    return this.service.listAllFeatureFlags();
  }

  @Put('feature-flags/:key')
  @UseGuards(SystemAdminGuard)
  async setFeatureFlag(
    @Param('key') key: string,
    @Body() body: { isEnabled: boolean; organizationId?: string },
  ) {
    await this.service.setFeatureFlag(key, body.isEnabled, body.organizationId);
    return { success: true };
  }

  @Post('users/:userId/make-admin')
  @UseGuards(SystemAdminGuard)
  async makeAdmin(@Param('userId') userId: string) {
    await this.service.addSystemAdmin(userId);
    return { success: true };
  }

  @Delete('users/:userId/make-admin')
  @UseGuards(SystemAdminGuard)
  async removeAdmin(@Param('userId') userId: string) {
    await this.service.removeSystemAdmin(userId);
    return { success: true };
  }
}
