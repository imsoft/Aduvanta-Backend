import {
  Controller,
  Post,
  Req,
  Res,
  Logger,
  HttpStatus,
  Header,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { StripeService } from './stripe.service.js';
import { StripeWebhookService } from './stripe-webhook.service.js';
import { StripeProcessedEventsRepository } from './stripe-processed-events.repository.js';
import type Stripe from 'stripe';

@Controller('stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly stripeWebhookService: StripeWebhookService,
    private readonly processedEventsRepo: StripeProcessedEventsRepository,
  ) {}

  @Post('webhooks')
  @Header('Content-Type', 'application/json')
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const signature = req.headers['stripe-signature'];

    if (!signature || typeof signature !== 'string') {
      this.logger.warn('Webhook received without stripe-signature header');
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Missing stripe-signature header' });
      return;
    }

    let event: Stripe.Event;

    try {
      event = this.stripeService.constructEvent(req.body as Buffer, signature);
    } catch (error) {
      this.logger.error({ error }, 'Webhook signature verification failed');
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Webhook signature verification failed' });
      return;
    }

    // Idempotency: Stripe guarantees at-least-once delivery. If we already
    // processed this event, reply 200 and skip the handler.
    const firstTime = await this.processedEventsRepo.markProcessed(
      event.id,
      event.type,
    );

    if (!firstTime) {
      this.logger.log(
        { eventId: event.id, eventType: event.type },
        'Stripe webhook already processed — skipping (idempotent replay)',
      );
      res.status(HttpStatus.OK).json({ received: true, duplicate: true });
      return;
    }

    this.logger.log(
      { eventId: event.id, eventType: event.type },
      'Stripe webhook received',
    );

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          await this.stripeWebhookService.handleCheckoutCompleted(session);
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          await this.stripeWebhookService.handleSubscriptionUpdated(
            subscription,
          );
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          await this.stripeWebhookService.handleSubscriptionDeleted(
            subscription,
          );
          break;
        }

        case 'invoice.paid': {
          const invoice = event.data.object;
          await this.stripeWebhookService.handleInvoicePaid(invoice);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          await this.stripeWebhookService.handlePaymentFailed(invoice);
          break;
        }

        default: {
          this.logger.log(
            { eventId: event.id, eventType: event.type },
            'Unhandled Stripe event type — ignoring',
          );
        }
      }
    } catch (error) {
      // Release the idempotency marker so Stripe retries reprocess cleanly
      // once the underlying bug is fixed. Return 500 to trigger Stripe
      // automatic retry with exponential backoff.
      await this.processedEventsRepo.unmark(event.id);
      this.logger.error(
        { error, eventId: event.id, eventType: event.type },
        'Error processing Stripe webhook event — responding 500 to let Stripe retry',
      );
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Error processing webhook event' });
      return;
    }

    res.status(HttpStatus.OK).json({ received: true });
  }
}
