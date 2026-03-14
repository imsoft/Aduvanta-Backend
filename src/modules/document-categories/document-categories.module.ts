import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DocumentCategoriesRepository } from './document-categories.repository.js';
import { DocumentCategoriesService } from './document-categories.service.js';
import { DocumentCategoriesController } from './document-categories.controller.js';

@Module({
  imports: [AuthModule],
  providers: [DocumentCategoriesRepository, DocumentCategoriesService],
  controllers: [DocumentCategoriesController],
  exports: [DocumentCategoriesRepository, DocumentCategoriesService],
})
export class DocumentCategoriesModule {}
