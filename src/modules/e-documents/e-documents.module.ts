import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { EDocumentsRepository } from './e-documents.repository.js';
import { EDocumentsService } from './e-documents.service.js';
import { EDocumentsController } from './e-documents.controller.js';

@Module({
  imports: [AuthModule],
  providers: [EDocumentsRepository, EDocumentsService, PermissionsGuard],
  controllers: [EDocumentsController],
  exports: [EDocumentsService],
})
export class EDocumentsModule {}
