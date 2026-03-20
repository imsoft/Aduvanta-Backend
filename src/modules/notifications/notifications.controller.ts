import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
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
import { NotificationsService } from './notifications.service.js';
import { CreateNotificationDto } from './dto/create-notification.dto.js';
import { BulkNotificationDto } from './dto/bulk-notification.dto.js';
import { UpdatePreferencesDto } from './dto/update-preferences.dto.js';
import { ListNotificationsDto } from './dto/list-notifications.dto.js';

@Controller('notifications')
@UseGuards(AuthGuard, PermissionsGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @RequirePermission(PERMISSION.NOTIFICATIONS_READ)
  async listNotifications(
    @Query() dto: ListNotificationsDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    const isRead =
      dto.isRead === 'true' ? true : dto.isRead === 'false' ? false : undefined;
    return this.service.listNotifications(
      organizationId,
      session.user.id,
      dto.type,
      isRead,
      limit,
      offset,
    );
  }

  @Get('unread-count')
  @RequirePermission(PERMISSION.NOTIFICATIONS_READ)
  async getUnreadCount(
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getUnreadCount(organizationId, session.user.id);
  }

  @Post('send')
  @RequirePermission(PERMISSION.NOTIFICATIONS_CREATE)
  async sendNotification(
    @Body() dto: CreateNotificationDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.sendNotification(dto, session.user.id, organizationId);
  }

  @Post('send-bulk')
  @RequirePermission(PERMISSION.NOTIFICATIONS_MANAGE)
  async sendBulkNotifications(
    @Body() dto: BulkNotificationDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.sendBulkNotifications(
      dto,
      session.user.id,
      organizationId,
    );
  }

  @Post(':id/read')
  @RequirePermission(PERMISSION.NOTIFICATIONS_READ)
  async markAsRead(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.markAsRead(id, session.user.id, organizationId);
  }

  @Post('read-all')
  @RequirePermission(PERMISSION.NOTIFICATIONS_READ)
  async markAllAsRead(
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.markAllAsRead(organizationId, session.user.id);
  }

  @Delete(':id')
  @RequirePermission(PERMISSION.NOTIFICATIONS_READ)
  async deleteNotification(
    @Param('id') id: string,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    await this.service.deleteNotification(id, session.user.id, organizationId);
    return { success: true };
  }

  // ========== Preferences ==========

  @Get('preferences')
  @RequirePermission(PERMISSION.NOTIFICATIONS_PREFERENCES_UPDATE)
  async getPreferences(
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.getPreferences(organizationId, session.user.id);
  }

  @Post('preferences')
  @RequirePermission(PERMISSION.NOTIFICATIONS_PREFERENCES_UPDATE)
  async updatePreferences(
    @Body() dto: UpdatePreferencesDto,
    @Session() session: ActiveSession,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return this.service.updatePreferences(dto, session.user.id, organizationId);
  }
}
