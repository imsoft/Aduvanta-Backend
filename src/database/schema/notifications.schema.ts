import { pgTable, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema.js';

export const notificationTypeEnum = pgEnum('notification_type', [
  'SYSTEM', // Sistema
  'OPERATION', // Operación aduanera
  'DOCUMENT', // Documento
  'BILLING', // Facturación
  'COMPLIANCE', // Cumplimiento
  'SHIPMENT', // Embarque
  'CUPO', // CUPO / cuota
  'WAREHOUSE', // Almacén
  'ALERT', // Alerta urgente
  'REMINDER', // Recordatorio
]);

export const notificationChannelEnum = pgEnum('notification_channel', [
  'IN_APP', // Dentro de la plataforma
  'EMAIL', // Correo electrónico
  'SMS', // Mensaje de texto
  'WEBHOOK', // Webhook externo
]);

export const notificationPriorityEnum = pgEnum('notification_priority', [
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT',
]);

export const notifications = pgTable('notifications', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  recipientUserId: text('recipient_user_id').notNull(),
  type: notificationTypeEnum('type').notNull(),
  channel: notificationChannelEnum('channel').notNull().default('IN_APP'),
  priority: notificationPriorityEnum('priority').notNull().default('NORMAL'),
  title: text('title').notNull(),
  body: text('body').notNull(),
  resourceType: text('resource_type'),
  resourceId: text('resource_id'),
  actionUrl: text('action_url'),
  isRead: boolean('is_read').notNull().default(false),
  readAt: timestamp('read_at', { withTimezone: true }),
  isSent: boolean('is_sent').notNull().default(false),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  metadata: text('metadata'),
  createdById: text('created_by_id'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
