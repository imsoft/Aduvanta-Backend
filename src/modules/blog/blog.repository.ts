import { Injectable, Inject } from '@nestjs/common';
import { eq, desc, sql, and } from 'drizzle-orm';
import { DATABASE } from '../../database/database.module.js';
import type { Database } from '../../database/database.module.js';
import { blogPosts } from '../../database/schema/blog-posts.schema.js';

export type BlogPost = typeof blogPosts.$inferSelect;

export type CreateBlogPostData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  status: string;
  authorId: string;
  authorName: string;
  readingTimeMinutes: number;
  publishedAt?: Date;
};

export type UpdateBlogPostData = {
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string | null;
  status?: string;
  readingTimeMinutes?: number;
  publishedAt?: Date | null;
  updatedAt: Date;
};

@Injectable()
export class BlogRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findAll(opts: {
    page: number;
    limit: number;
    status?: string;
  }): Promise<{ posts: BlogPost[]; total: number }> {
    const offset = (opts.page - 1) * opts.limit;

    const where = opts.status ? eq(blogPosts.status, opts.status) : undefined;

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(blogPosts)
        .where(where)
        .orderBy(desc(blogPosts.createdAt))
        .limit(opts.limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(blogPosts)
        .where(where),
    ]);

    return { posts: rows, total: countResult[0]?.count ?? 0 };
  }

  async findBySlug(slug: string): Promise<BlogPost | undefined> {
    const rows = await this.db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    return rows[0];
  }

  async findById(id: string): Promise<BlogPost | undefined> {
    const rows = await this.db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1);

    return rows[0];
  }

  async create(data: CreateBlogPostData): Promise<BlogPost> {
    const rows = await this.db
      .insert(blogPosts)
      .values({
        id: data.id,
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        coverImageUrl: data.coverImageUrl,
        status: data.status,
        authorId: data.authorId,
        authorName: data.authorName,
        readingTimeMinutes: data.readingTimeMinutes,
        publishedAt: data.publishedAt,
      })
      .returning();

    return rows[0];
  }

  async update(id: string, data: UpdateBlogPostData): Promise<BlogPost> {
    const rows = await this.db
      .update(blogPosts)
      .set(data)
      .where(eq(blogPosts.id, id))
      .returning();

    return rows[0];
  }

  async findPublished(opts: {
    page: number;
    limit: number;
  }): Promise<{ posts: BlogPost[]; total: number }> {
    const offset = (opts.page - 1) * opts.limit;
    const where = and(eq(blogPosts.status, 'PUBLISHED'));

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(blogPosts)
        .where(where)
        .orderBy(desc(blogPosts.publishedAt))
        .limit(opts.limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(blogPosts)
        .where(where),
    ]);

    return { posts: rows, total: countResult[0]?.count ?? 0 };
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(blogPosts).where(eq(blogPosts.id, id));
  }
}
