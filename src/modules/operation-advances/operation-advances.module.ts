import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { OperationsModule } from '../operations/operations.module.js';
import { OperationAdvancesRepository } from './operation-advances.repository.js';
import { OperationAdvancesService } from './operation-advances.service.js';
import { OperationAdvancesController } from './operation-advances.controller.js';

@Module({
  imports: [AuthModule, OperationsModule],
  providers: [OperationAdvancesRepository, OperationAdvancesService],
  controllers: [OperationAdvancesController],
  exports: [OperationAdvancesRepository, OperationAdvancesService],
})
export class OperationAdvancesModule {}
