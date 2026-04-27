import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogRepository, type BlogPost } from './blog.repository.js';
import type { CreateBlogPostDto, UpdateBlogPostDto } from './blog.schema.js';

const WORDS_PER_MINUTE = 200;

function calculateReadingTime(content: string): number {
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

@Injectable()
export class BlogService {
  constructor(private readonly repo: BlogRepository) {}

  async listPublished(
    page: number,
    limit: number,
  ): Promise<{ posts: BlogPost[]; total: number }> {
    return this.repo.findPublished({ page, limit });
  }

  async getBySlug(slug: string): Promise<BlogPost> {
    const post = await this.repo.findBySlug(slug);

    if (!post || post.status !== 'PUBLISHED') {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`);
    }

    return post;
  }

  async listAll(
    page: number,
    limit: number,
    status?: string,
  ): Promise<{ posts: BlogPost[]; total: number }> {
    return this.repo.findAll({ page, limit, status });
  }

  async create(
    dto: CreateBlogPostDto,
    authorId: string,
    authorName: string,
  ): Promise<BlogPost> {
    const id = crypto.randomUUID();
    const readingTimeMinutes = calculateReadingTime(dto.content);
    const publishedAt = dto.status === 'PUBLISHED' ? new Date() : undefined;

    return this.repo.create({
      id,
      slug: dto.slug,
      title: dto.title,
      excerpt: dto.excerpt,
      content: dto.content,
      coverImageUrl: dto.coverImageUrl,
      status: dto.status,
      authorId,
      authorName,
      readingTimeMinutes,
      publishedAt,
    });
  }

  async getById(id: string): Promise<BlogPost> {
    const post = await this.repo.findById(id);

    if (!post) {
      throw new NotFoundException(`Blog post with id "${id}" not found`);
    }

    return post;
  }

  async update(id: string, dto: UpdateBlogPostDto): Promise<BlogPost> {
    const existing = await this.repo.findById(id);

    if (!existing) {
      throw new NotFoundException(`Blog post with id "${id}" not found`);
    }

    const readingTimeMinutes =
      dto.content !== undefined
        ? calculateReadingTime(dto.content)
        : existing.readingTimeMinutes;

    let publishedAt = existing.publishedAt;
    if (dto.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      publishedAt = new Date();
    } else if (dto.status === 'DRAFT') {
      publishedAt = null;
    }

    return this.repo.update(id, {
      ...(dto.slug !== undefined && { slug: dto.slug }),
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
      ...(dto.content !== undefined && { content: dto.content }),
      ...(dto.coverImageUrl !== undefined && {
        coverImageUrl: dto.coverImageUrl,
      }),
      ...(dto.status !== undefined && { status: dto.status }),
      readingTimeMinutes,
      publishedAt,
      updatedAt: new Date(),
    });
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repo.findById(id);

    if (!existing) {
      throw new NotFoundException(`Blog post with id "${id}" not found`);
    }

    await this.repo.delete(id);
  }
}
