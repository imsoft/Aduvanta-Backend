import { Inject, Injectable } from '@nestjs/common';
import { eq, and, desc, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';
import {
  notifications,
  notificationPreferences,
} from '../../database/schema/index.js';

export type NotificationRecord = typeof notifications.$inferSelect;
export type PreferenceRecord = typeof notificationPreferences.$inferSelect;

@Injectable()
export class NotificationsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  // --- Notifications ---

  async findByRecipient(
    organizationId: string,
    recipientUserId: string,
    type: string | undefined,
    isRead: boolean | undefined,
    limit: number,
    offset: number,
  ): Promise<{ notifications: NotificationRecord[]; total: number }> {
    const conditions = [
      eq(notifications.organizationId, organizationId),
      eq(notifications.recipientUserId, recipientUserId),
    ];

    if (type) {
      conditions.push(eq(notifications.type, type as 'SYSTEM'));
    }
    if (isRead !== undefined) {
      eq(notifications.isRead, isRead);
      conditions.push(eq(notifications.isRead, isRead));
    }

    const where = and(...conditions);

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(notifications)
        .where(where)
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(where),
    ]);

    return { notifications: rows, total: countResult[0].count };
  }

  async countUnread(
    organizationId: string,
    recipientUserId: string,
  ): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(
        and(
          eq(notifications.organizationId, organizationId),
          eq(notifications.recipientUserId, recipientUserId),
          eq(notifications.isRead, false),
        ),
      );

    return result[0].count;
  }

  async findById(id: string): Promise<NotificationRecord | undefined> {
    const result = await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    return result[0];
  }

  async insertNotification(
    data: typeof notifications.$inferInsert,
  ): Promise<NotificationRecord> {
    const [created] = await this.db
      .insert(notifications)
      .values(data)
      .returning();

    return created;
  }

  async insertMany(
    data: (typeof notifications.$inferInsert)[],
  ): Promise<NotificationRecord[]> {
    return this.db.insert(notifications).values(data).returning();
  }

  async markAsRead(id: string): Promise<NotificationRecord> {
    const [updated] = await this.db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();

    return updated;
  }

  async markAllAsRead(
    organizationId: string,
    recipientUserId: string,
  ): Promise<void> {
    await this.db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notifications.organizationId, organizationId),
          eq(notifications.recipientUserId, recipientUserId),
          eq(notifications.isRead, false),
        ),
      );
  }

  async deleteNotification(id: string): Promise<void> {
    await this.db.delete(notifications).where(eq(notifications.id, id));
  }

  // --- Preferences ---

  async findPreferencesByUser(
    organizationId: string,
    userId: string,
  ): Promise<PreferenceRecord[]> {
    return this.db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.organizationId, organizationId),
          eq(notificationPreferences.userId, userId),
        ),
      );
  }

  async findPreference(
    organizationId: string,
    userId: string,
    notificationType: string,
  ): Promise<PreferenceRecord | undefined> {
    const result = await this.db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.organizationId, organizationId),
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.notificationType, notificationType),
        ),
      )
      .limit(1);

    return result[0];
  }

  async upsertPreference(
    data: typeof notificationPreferences.$inferInsert,
  ): Promise<PreferenceRecord> {
    const existing = await this.findPreference(
      data.organizationId,
      data.userId,
      data.notificationType,
    );

    if (existing) {
      const [updated] = await this.db
        .update(notificationPreferences)
        .set({
          inAppEnabled: data.inAppEnabled,
          emailEnabled: data.emailEnabled,
          smsEnabled: data.smsEnabled,
          webhookEnabled: data.webhookEnabled,
        })
        .where(eq(notificationPreferences.id, existing.id))
        .returning();

      return updated;
    }

    const [created] = await this.db
      .insert(notificationPreferences)
      .values(data)
      .returning();

    return created;
  }
}
