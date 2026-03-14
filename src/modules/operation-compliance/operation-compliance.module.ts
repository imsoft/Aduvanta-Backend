import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { OperationsModule } from '../operations/operations.module.js';
import { ComplianceRuleSetsModule } from '../compliance-rule-sets/compliance-rule-sets.module.js';
import { ComplianceDocumentRequirementsModule } from '../compliance-document-requirements/compliance-document-requirements.module.js';
import { ComplianceStatusRulesModule } from '../compliance-status-rules/compliance-status-rules.module.js';
import { DocumentsModule } from '../documents/documents.module.js';
import { DocumentCategoriesModule } from '../document-categories/document-categories.module.js';
import { OperationComplianceService } from './operation-compliance.service.js';
import { OperationComplianceController } from './operation-compliance.controller.js';

@Module({
  imports: [
    AuthModule,
    OperationsModule,
    ComplianceRuleSetsModule,
    ComplianceDocumentRequirementsModule,
    ComplianceStatusRulesModule,
    DocumentsModule,
    DocumentCategoriesModule,
  ],
  providers: [OperationComplianceService],
  controllers: [OperationComplianceController],
  exports: [OperationComplianceService],
})
export class OperationComplianceModule {}
