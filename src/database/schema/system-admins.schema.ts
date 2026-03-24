import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const systemAdmins = pgTable('system_admins', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
