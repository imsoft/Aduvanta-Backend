import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { OperationsModule } from '../operations/operations.module.js';
import { OperationChargesRepository } from './operation-charges.repository.js';
import { OperationChargesService } from './operation-charges.service.js';
import { OperationChargesController } from './operation-charges.controller.js';

@Module({
  imports: [AuthModule, OperationsModule],
  providers: [OperationChargesRepository, OperationChargesService],
  controllers: [OperationChargesController],
  exports: [OperationChargesRepository, OperationChargesService],
})
export class OperationChargesModule {}
