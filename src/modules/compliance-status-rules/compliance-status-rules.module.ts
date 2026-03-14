import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ComplianceRuleSetsModule } from '../compliance-rule-sets/compliance-rule-sets.module.js';
import { ComplianceStatusRulesRepository } from './compliance-status-rules.repository.js';
import { ComplianceStatusRulesService } from './compliance-status-rules.service.js';
import { ComplianceStatusRulesController } from './compliance-status-rules.controller.js';

@Module({
  imports: [AuthModule, ComplianceRuleSetsModule],
  providers: [ComplianceStatusRulesRepository, ComplianceStatusRulesService],
  controllers: [ComplianceStatusRulesController],
  exports: [ComplianceStatusRulesRepository, ComplianceStatusRulesService],
})
export class ComplianceStatusRulesModule {}
