import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ComplianceRuleSetsRepository } from './compliance-rule-sets.repository.js';
import { ComplianceRuleSetsService } from './compliance-rule-sets.service.js';
import { ComplianceRuleSetsController } from './compliance-rule-sets.controller.js';

@Module({
  imports: [AuthModule],
  providers: [ComplianceRuleSetsRepository, ComplianceRuleSetsService],
  controllers: [ComplianceRuleSetsController],
  exports: [ComplianceRuleSetsRepository, ComplianceRuleSetsService],
})
export class ComplianceRuleSetsModule {}
