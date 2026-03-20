import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DocumentCategoriesModule } from '../document-categories/document-categories.module.js';
import { OperationsModule } from '../operations/operations.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { DocumentsRepository } from './documents.repository.js';
import { DocumentsService } from './documents.service.js';
import { DocumentsController } from './documents.controller.js';

@Module({
  imports: [
    AuthModule,
    DocumentCategoriesModule,
    OperationsModule,
    StorageModule,
  ],
  providers: [DocumentsRepository, DocumentsService],
  controllers: [DocumentsController],
  exports: [DocumentsRepository, DocumentsService],
})
export class DocumentsModule {}
