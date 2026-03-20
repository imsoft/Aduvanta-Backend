import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  NotificationsRepository,
  type NotificationRecord,
  type PreferenceRecord,
} from './notifications.repository.js';
import type { CreateNotificationDto } from './dto/create-notification.dto.js';
import type { BulkNotificationDto } from './dto/bulk-notification.dto.js';
import type { UpdatePreferencesDto } from './dto/update-preferences.dto.js';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly repository: NotificationsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async listNotifications(
    organizationId: string,
    recipientUserId: string,
    type: string | undefined,
    isRead: boolean | undefined,
    limit: number,
    offset: number,
  ): Promise<{ notifications: NotificationRecord[]; total: number }> {
    return this.repository.findByRecipient(
      organizationId,
      recipientUserId,
      type,
      isRead,
      limit,
      offset,
    );
  }

  async getUnreadCount(
    organizationId: string,
    recipientUserId: string,
  ): Promise<{ count: number }> {
    const count = await this.repository.countUnread(
      organizationId,
      recipientUserId,
    );
    return { count };
  }

  async sendNotification(
    dto: CreateNotificationDto,
    actorId: string,
    organizationId: string,
  ): Promise<NotificationRecord> {
    const notification = await this.repository.insertNotification({
      organizationId,
      recipientUserId: dto.recipientUserId,
      type: dto.type as 'SYSTEM',
      channel: (dto.channel as 'IN_APP') ?? 'IN_APP',
      priority: (dto.priority as 'NORMAL') ?? 'NORMAL',
      title: dto.title,
      body: dto.body,
      resourceType: dto.resourceType,
      resourceId: dto.resourceId,
      actionUrl: dto.actionUrl,
      metadata: dto.metadata,
      createdById: actorId,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.NOTIFICATION_SENT,
      resource: 'notification',
      resourceId: notification.id,
      metadata: {
        recipientUserId: dto.recipientUserId,
        type: dto.type,
        title: dto.title,
      },
    });

    return notification;
  }

  async sendBulkNotifications(
    dto: BulkNotificationDto,
    actorId: string,
    organizationId: string,
  ): Promise<NotificationRecord[]> {
    const records = dto.recipientUserIds.map((recipientUserId) => ({
      organizationId,
      recipientUserId,
      type: dto.type as 'SYSTEM',
      channel: (dto.channel as 'IN_APP') ?? 'IN_APP',
      priority: (dto.priority as 'NORMAL') ?? 'NORMAL',
      title: dto.title,
      body: dto.body,
      resourceType: dto.resourceType,
      resourceId: dto.resourceId,
      actionUrl: dto.actionUrl,
      metadata: dto.metadata,
      createdById: actorId,
    }));

    const created = await this.repository.insertMany(records);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.NOTIFICATION_BULK_SENT,
      resource: 'notification',
      resourceId: created[0]?.id ?? 'bulk',
      metadata: {
        recipientCount: dto.recipientUserIds.length,
        type: dto.type,
        title: dto.title,
      },
    });

    return created;
  }

  async markAsRead(
    id: string,
    recipientUserId: string,
    organizationId: string,
  ): Promise<NotificationRecord> {
    const notification = await this.repository.findById(id);
    if (
      !notification ||
      notification.organizationId !== organizationId ||
      notification.recipientUserId !== recipientUserId
    ) {
      throw new NotFoundException(`Notification ${id} not found`);
    }

    return this.repository.markAsRead(id);
  }

  async markAllAsRead(
    organizationId: string,
    recipientUserId: string,
  ): Promise<{ success: boolean }> {
    await this.repository.markAllAsRead(organizationId, recipientUserId);
    return { success: true };
  }

  async deleteNotification(
    id: string,
    recipientUserId: string,
    organizationId: string,
  ): Promise<void> {
    const notification = await this.repository.findById(id);
    if (
      !notification ||
      notification.organizationId !== organizationId ||
      notification.recipientUserId !== recipientUserId
    ) {
      throw new NotFoundException(`Notification ${id} not found`);
    }

    await this.repository.deleteNotification(id);
  }

  // ========== Preferences ==========

  async getPreferences(
    organizationId: string,
    userId: string,
  ): Promise<PreferenceRecord[]> {
    return this.repository.findPreferencesByUser(organizationId, userId);
  }

  async updatePreferences(
    dto: UpdatePreferencesDto,
    actorId: string,
    organizationId: string,
  ): Promise<PreferenceRecord> {
    const preference = await this.repository.upsertPreference({
      organizationId,
      userId: actorId,
      notificationType: dto.notificationType,
      inAppEnabled: dto.inAppEnabled,
      emailEnabled: dto.emailEnabled,
      smsEnabled: dto.smsEnabled,
      webhookEnabled: dto.webhookEnabled,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.NOTIFICATION_PREFERENCES_UPDATED,
      resource: 'notification_preference',
      resourceId: preference.id,
      metadata: { notificationType: dto.notificationType },
    });

    return preference;
  }
}
