import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { OperationsModule } from '../operations/operations.module.js';
import { OperationChargesModule } from '../operation-charges/operation-charges.module.js';
import { OperationAdvancesModule } from '../operation-advances/operation-advances.module.js';
import { OperationFinanceService } from './operation-finance.service.js';
import { OperationFinanceController } from './operation-finance.controller.js';

@Module({
  imports: [
    AuthModule,
    OperationsModule,
    OperationChargesModule,
    OperationAdvancesModule,
  ],
  providers: [OperationFinanceService],
  controllers: [OperationFinanceController],
  exports: [OperationFinanceService],
})
export class OperationFinanceModule {}
