import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { BillingRepository } from './billing.repository.js';
import { BillingService } from './billing.service.js';
import { BillingController } from './billing.controller.js';

@Module({
  imports: [AuthModule],
  providers: [BillingRepository, BillingService, PermissionsGuard],
  controllers: [BillingController],
  exports: [BillingService],
})
export class BillingModule {}
