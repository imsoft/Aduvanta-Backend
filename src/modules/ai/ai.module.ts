import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { OperationsModule } from '../operations/operations.module.js';
import { OperationComplianceModule } from '../operation-compliance/operation-compliance.module.js';
import { OperationFinanceModule } from '../operation-finance/operation-finance.module.js';
import { AiSearchService } from './ai-search.service.js';
import { AiSignalsService } from './ai-signals.service.js';
import { AiSummariesService } from './ai-summaries.service.js';
import { AiController } from './ai.controller.js';

@Module({
  imports: [
    AuthModule,
    AuditLogsModule,
    OperationsModule,
    OperationComplianceModule,
    OperationFinanceModule,
  ],
  providers: [AiSearchService, AiSignalsService, AiSummariesService],
  controllers: [AiController],
})
export class AiModule {}
