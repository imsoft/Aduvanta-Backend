import { Global, Module } from '@nestjs/common';
import { StripeService } from './stripe.service.js';
import { StripeWebhookController } from './stripe-webhook.controller.js';
import { StripeWebhookService } from './stripe-webhook.service.js';
import { StripeProcessedEventsRepository } from './stripe-processed-events.repository.js';

@Global()
@Module({
  providers: [
    StripeService,
    StripeWebhookService,
    StripeProcessedEventsRepository,
  ],
  controllers: [StripeWebhookController],
  exports: [StripeService],
})
export class StripeModule {}
