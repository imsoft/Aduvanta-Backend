import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { SubscriptionsRepository } from './subscriptions.repository.js';
import { SubscriptionsService } from './subscriptions.service.js';
import { SubscriptionsController } from './subscriptions.controller.js';

@Module({
  imports: [AuthModule, AuditLogsModule],
  providers: [SubscriptionsRepository, SubscriptionsService],
  controllers: [SubscriptionsController],
  exports: [SubscriptionsRepository, SubscriptionsService],
})
export class SubscriptionsModule {}
