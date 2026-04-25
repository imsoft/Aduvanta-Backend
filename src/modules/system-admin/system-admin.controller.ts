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

const MAX_PAGE_LIMIT = 100;

function parsePagination(
  limit: string,
  offset: string,
): { limit: number; offset: number } {
  return {
    limit: Math.min(Math.max(parseInt(limit) || 0, 1), MAX_PAGE_LIMIT),
    offset: Math.max(parseInt(offset) || 0, 0),
  };
}

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
    const p = parsePagination(limit, offset);
    return this.service.listAllOrganizations(p.limit, p.offset);
  }

  @Get('users')
  @UseGuards(SystemAdminGuard)
  async listUsers(
    @Query('limit') limit = '25',
    @Query('offset') offset = '0',
    @Query('search') search?: string,
  ) {
    const p = parsePagination(limit, offset);
    return this.service.listAllUsers(p.limit, p.offset, search);
  }

  @Get('entries')
  @UseGuards(SystemAdminGuard)
  async listEntries(
    @Query('limit') limit = '25',
    @Query('offset') offset = '0',
    @Query('search') search?: string,
  ) {
    const p = parsePagination(limit, offset);
    return this.service.listAllEntries(p.limit, p.offset, search);
  }

  @Get('operations')
  @UseGuards(SystemAdminGuard)
  async listOperations(
    @Query('limit') limit = '25',
    @Query('offset') offset = '0',
  ) {
    const p = parsePagination(limit, offset);
    return this.service.listAllOperations(p.limit, p.offset);
  }

  @Get('audit-logs')
  @UseGuards(SystemAdminGuard)
  async listAuditLogs(
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    const p = parsePagination(limit, offset);
    return this.service.listAllAuditLogs(p.limit, p.offset);
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
    const p = parsePagination(limit, offset);
    return this.service.getUsageByOrganization(p.limit, p.offset);
  }

  @Get('sessions')
  @UseGuards(SystemAdminGuard)
  async listSessions(
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    const p = parsePagination(limit, offset);
    return this.service.listActiveSessions(p.limit, p.offset);
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
