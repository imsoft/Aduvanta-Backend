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

  // Active announcements — any authenticated user can fetch them
  @Get('announcements/active')
  async getActiveAnnouncements() {
    return this.service.listActiveAnnouncements();
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
    return this.service.listAllOrganizations(parseInt(limit), parseInt(offset));
  }

  @Get('users')
  @UseGuards(SystemAdminGuard)
  async listUsers(
    @Query('limit') limit = '25',
    @Query('offset') offset = '0',
    @Query('search') search?: string,
  ) {
    return this.service.listAllUsers(parseInt(limit), parseInt(offset), search);
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

  @Get('usage')
  @UseGuards(SystemAdminGuard)
  async getUsage(
    @Query('limit') limit = '25',
    @Query('offset') offset = '0',
  ) {
    return this.service.getUsageByOrganization(parseInt(limit), parseInt(offset));
  }

  @Get('sessions')
  @UseGuards(SystemAdminGuard)
  async listSessions(
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.service.listActiveSessions(parseInt(limit), parseInt(offset));
  }

  @Delete('sessions/:sessionId')
  @UseGuards(SystemAdminGuard)
  async revokeSession(@Param('sessionId') sessionId: string) {
    await this.service.revokeSession(sessionId);
    return { success: true };
  }

  @Get('billing')
  @UseGuards(SystemAdminGuard)
  async getBilling() {
    return this.service.getBillingSummary();
  }

  @Get('announcements')
  @UseGuards(SystemAdminGuard)
  async listAnnouncements() {
    return this.service.listAnnouncements();
  }

  @Post('announcements')
  @UseGuards(SystemAdminGuard)
  async createAnnouncement(
    @Session() session: ActiveSession,
    @Body()
    body: {
      title: string;
      body: string;
      level: 'INFO' | 'WARNING' | 'CRITICAL';
      startsAt?: string;
      endsAt?: string;
    },
  ) {
    return this.service.createAnnouncement({
      title: body.title,
      body: body.body,
      level: body.level,
      startsAt: body.startsAt ? new Date(body.startsAt) : new Date(),
      endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
      createdById: session.user.id,
    });
  }

  @Put('announcements/:id')
  @UseGuards(SystemAdminGuard)
  async updateAnnouncement(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      title: string;
      body: string;
      level: 'INFO' | 'WARNING' | 'CRITICAL';
      isActive: boolean;
      startsAt: string;
      endsAt: string | null;
    }>,
  ) {
    return this.service.updateAnnouncement(id, {
      ...body,
      startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
      endsAt: body.endsAt !== undefined ? (body.endsAt ? new Date(body.endsAt) : null) : undefined,
    });
  }

  @Delete('announcements/:id')
  @UseGuards(SystemAdminGuard)
  async deleteAnnouncement(@Param('id') id: string) {
    await this.service.deleteAnnouncement(id);
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
