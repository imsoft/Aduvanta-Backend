import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { BillingOverridesRepository } from './billing-overrides.repository.js';
import { BillingOverridesService } from './billing-overrides.service.js';
import { BillingOverridesController } from './billing-overrides.controller.js';

@Module({
  imports: [AuthModule],
  providers: [BillingOverridesRepository, BillingOverridesService],
  controllers: [BillingOverridesController],
  exports: [BillingOverridesService],
})
export class BillingOverridesModule {}
