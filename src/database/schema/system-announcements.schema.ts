import { boolean, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const announcementLevelEnum = pgEnum('announcement_level', [
  'INFO',
  'WARNING',
  'CRITICAL',
]);

export type AnnouncementLevel = (typeof announcementLevelEnum.enumValues)[number];

export const systemAnnouncements = pgTable('system_announcements', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  body: text('body').notNull(),
  level: announcementLevelEnum('level').notNull().default('INFO'),
  isActive: boolean('is_active').notNull().default(true),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull().defaultNow(),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  createdById: text('created_by_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
