import {
  BadGatewayException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AppConfigService } from '../../config/config.service.js';
import { StorageService } from '../storage/storage.service.js';
import { BlogRepository, type BlogPost } from './blog.repository.js';
import type { CreateBlogPostDto, UpdateBlogPostDto, TranslateBlogPostDto } from './blog.schema.js';

type TranslateResult = { title: string; excerpt: string; content: string };

const WORDS_PER_MINUTE = 200;

function calculateReadingTime(content: string): number {
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

@Injectable()
export class BlogService {
  constructor(
    private readonly repo: BlogRepository,
    private readonly config: AppConfigService,
    private readonly storage: StorageService,
  ) {}

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

  async uploadCoverImage(
    buffer: Buffer,
    mimetype: string,
  ): Promise<{ url: string }> {
    const ext = mimetype.split('/')[1] ?? 'jpg';
    const key = `blog-covers/${crypto.randomUUID()}.${ext}`;
    await this.storage.upload(key, buffer, mimetype);
    return { url: this.storage.getPublicUrl(key) };
  }

  async translate(dto: TranslateBlogPostDto): Promise<TranslateResult> {
    const apiKey = this.config.get('GOOGLE_TRANSLATE_API_KEY');

    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Translation service is not configured. Set GOOGLE_TRANSLATE_API_KEY.',
      );
    }

    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: [dto.title, dto.excerpt, dto.content],
          source: dto.source,
          target: dto.target,
          format: 'text',
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new BadGatewayException(
        `Google Translate returned ${response.status}: ${body}`,
      );
    }

    const result = (await response.json()) as {
      data: { translations: Array<{ translatedText: string }> };
    };

    const [t, e, c] = result.data.translations;

    return {
      title: t.translatedText,
      excerpt: e.translatedText,
      content: c.translatedText,
    };
  }
}
