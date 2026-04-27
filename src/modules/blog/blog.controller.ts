import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { SystemAdminGuard } from '../../common/guards/system-admin.guard.js';
import { Session } from '../../common/decorators/session.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator.js';
import { BlogService } from './blog.service.js';
import { CreateBlogPostDto, UpdateBlogPostDto, ListBlogPostsDto } from './blog.schema.js';

@Controller('blog')
export class BlogController {
  constructor(private readonly service: BlogService) {}

  // Public endpoints — no authentication required

  @Get('posts')
  @RateLimit('read')
  async listPublished(@Query() query: ListBlogPostsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return this.service.listPublished(page, limit);
  }

  @Get('posts/:slug')
  @RateLimit('read')
  async getBySlug(@Param('slug') slug: string) {
    return this.service.getBySlug(slug);
  }

  // Admin endpoints — system admin only

  @Get('admin/posts')
  @RateLimit('read')
  @UseGuards(AuthGuard, SystemAdminGuard)
  async listAll(@Query() query: ListBlogPostsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return this.service.listAll(page, limit, query.status);
  }

  @Get('admin/posts/:id')
  @RateLimit('read')
  @UseGuards(AuthGuard, SystemAdminGuard)
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('admin/posts')
  @RateLimit('mutation')
  @UseGuards(AuthGuard, SystemAdminGuard)
  async create(
    @Body() dto: CreateBlogPostDto,
    @Session() session: ActiveSession,
  ) {
    return this.service.create(dto, session.user.id, session.user.name);
  }

  @Patch('admin/posts/:id')
  @RateLimit('mutation')
  @UseGuards(AuthGuard, SystemAdminGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogPostDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete('admin/posts/:id')
  @RateLimit('mutation')
  @UseGuards(AuthGuard, SystemAdminGuard)
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return { success: true };
  }
}
