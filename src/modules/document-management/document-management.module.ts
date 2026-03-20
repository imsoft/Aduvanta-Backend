import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { DocumentManagementRepository } from './document-management.repository.js';
import { DocumentManagementService } from './document-management.service.js';
import { DocumentManagementController } from './document-management.controller.js';

@Module({
  imports: [AuthModule],
  providers: [
    DocumentManagementRepository,
    DocumentManagementService,
    PermissionsGuard,
  ],
  controllers: [DocumentManagementController],
  exports: [DocumentManagementService],
})
export class DocumentManagementModule {}
