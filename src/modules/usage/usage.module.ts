import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module.js';
import { UsageService } from './usage.service.js';
import { UsageController } from './usage.controller.js';

@Module({
  imports: [AuthModule, SubscriptionsModule],
  providers: [UsageService],
  controllers: [UsageController],
  exports: [UsageService],
})
export class UsageModule {}
