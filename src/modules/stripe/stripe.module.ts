import { Global, Module } from '@nestjs/common';
import { StripeService } from './stripe.service.js';
import { StripeWebhookController } from './stripe-webhook.controller.js';
import { StripeWebhookService } from './stripe-webhook.service.js';

@Global()
@Module({
  providers: [StripeService, StripeWebhookService],
  controllers: [StripeWebhookController],
  exports: [StripeService],
})
export class StripeModule {}
