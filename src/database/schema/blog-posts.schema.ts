import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const blogPosts = pgTable('blog_posts', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  coverImageUrl: text('cover_image_url'),
  status: text('status').notNull().default('DRAFT'),
  authorId: text('author_id').notNull(),
  authorName: text('author_name').notNull(),
  readingTimeMinutes: integer('reading_time_minutes').notNull().default(1),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
