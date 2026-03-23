import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';

export const notificationPreferences = pgTable('notification_preferences', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  userId: text('user_id').notNull(),
  notificationType: text('notification_type').notNull(),
  inAppEnabled: boolean('in_app_enabled').notNull().default(true),
  emailEnabled: boolean('email_enabled').notNull().default(true),
  smsEnabled: boolean('sms_enabled').notNull().default(false),
  webhookEnabled: boolean('webhook_enabled').notNull().default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
