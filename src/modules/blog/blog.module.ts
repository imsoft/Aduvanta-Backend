import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { BlogRepository } from './blog.repository.js';
import { BlogService } from './blog.service.js';
import { BlogController } from './blog.controller.js';

@Module({
  imports: [AuthModule],
  providers: [BlogRepository, BlogService],
  controllers: [BlogController],
  exports: [BlogService],
})
export class BlogModule {}
