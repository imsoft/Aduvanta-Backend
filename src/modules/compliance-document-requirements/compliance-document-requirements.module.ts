import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ComplianceRuleSetsModule } from '../compliance-rule-sets/compliance-rule-sets.module.js';
import { DocumentCategoriesModule } from '../document-categories/document-categories.module.js';
import { ComplianceDocumentRequirementsRepository } from './compliance-document-requirements.repository.js';
import { ComplianceDocumentRequirementsService } from './compliance-document-requirements.service.js';
import { ComplianceDocumentRequirementsController } from './compliance-document-requirements.controller.js';

@Module({
  imports: [AuthModule, ComplianceRuleSetsModule, DocumentCategoriesModule],
  providers: [
    ComplianceDocumentRequirementsRepository,
    ComplianceDocumentRequirementsService,
  ],
  controllers: [ComplianceDocumentRequirementsController],
  exports: [
    ComplianceDocumentRequirementsRepository,
    ComplianceDocumentRequirementsService,
  ],
})
export class ComplianceDocumentRequirementsModule {}
