import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module.js';
import { EventTrackingService } from './event-tracking.service.js';
import { EventTrackingInterceptor } from './event-tracking.interceptor.js';
import { EventTrackingController } from './event-tracking.controller.js';
import { ProductAnalyticsService } from './product-analytics.service.js';

@Global()
@Module({
  imports: [AuthModule, SubscriptionsModule],
  providers: [
    EventTrackingService,
    EventTrackingInterceptor,
    ProductAnalyticsService,
  ],
  controllers: [EventTrackingController],
  exports: [EventTrackingService, ProductAnalyticsService],
})
export class EventTrackingModule {}
