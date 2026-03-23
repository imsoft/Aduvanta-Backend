import Stripe from 'stripe';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AppConfigService } from '../../config/config.service.js';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe | null;
  private readonly webhookSecret: string | undefined;
  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly config: AppConfigService) {
    const secretKey = this.config.get('STRIPE_SECRET_KEY');
    this.webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');

    if (secretKey) {
      this.stripe = new Stripe(secretKey);
    } else {
      this.logger.warn(
        'STRIPE_SECRET_KEY is not set. Stripe functionality is disabled.',
      );
      this.stripe = null;
    }
  }

  // --- Customer management ---

  async createCustomer(params: {
    email: string;
    name: string;
    metadata: { organizationId: string };
  }): Promise<Stripe.Customer> {
    const client = this.assertConfigured();

    try {
      return await client.customers.create({
        email: params.email,
        name: params.name,
        metadata: params.metadata,
      });
    } catch (error) {
      this.logger.error({ error, params }, 'Failed to create Stripe customer');
      throw this.wrapStripeError(error);
    }
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer | null> {
    const client = this.assertConfigured();

    try {
      const customer = await client.customers.retrieve(customerId);
      if (customer.deleted) {
        return null;
      }
      return customer as Stripe.Customer;
    } catch (error) {
      if (this.isStripeNotFoundError(error)) {
        return null;
      }
      this.logger.error(
        { error, customerId },
        'Failed to retrieve Stripe customer',
      );
      throw this.wrapStripeError(error);
    }
  }

  // --- Checkout Sessions ---

  async createCheckoutSession(params: {
    customerId: string;
    priceId: string;
    organizationId: string;
    successUrl: string;
    cancelUrl: string;
    trialDays?: number;
  }): Promise<Stripe.Checkout.Session> {
    const client = this.assertConfigured();

    const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData =
      {
        metadata: { organizationId: params.organizationId },
      };

    if (params.trialDays !== undefined && params.trialDays > 0) {
      subscriptionData.trial_period_days = params.trialDays;
    }

    try {
      return await client.checkout.sessions.create({
        customer: params.customerId,
        mode: 'subscription',
        line_items: [{ price: params.priceId, quantity: 1 }],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        allow_promotion_codes: true,
        subscription_data: subscriptionData,
        metadata: { organizationId: params.organizationId },
      });
    } catch (error) {
      this.logger.error(
        { error, params },
        'Failed to create Stripe checkout session',
      );
      throw this.wrapStripeError(error);
    }
  }

  // --- Customer Portal ---

  async createPortalSession(params: {
    customerId: string;
    returnUrl: string;
  }): Promise<Stripe.BillingPortal.Session> {
    const client = this.assertConfigured();

    try {
      return await client.billingPortal.sessions.create({
        customer: params.customerId,
        return_url: params.returnUrl,
      });
    } catch (error) {
      this.logger.error(
        { error, params },
        'Failed to create Stripe portal session',
      );
      throw this.wrapStripeError(error);
    }
  }

  // --- Subscription management ---

  async getSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription | null> {
    const client = this.assertConfigured();

    try {
      return await client.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      if (this.isStripeNotFoundError(error)) {
        return null;
      }
      this.logger.error(
        { error, subscriptionId },
        'Failed to retrieve Stripe subscription',
      );
      throw this.wrapStripeError(error);
    }
  }

  async updateSubscription(
    subscriptionId: string,
    params: {
      priceId: string;
      prorationBehavior?: Stripe.SubscriptionUpdateParams.ProrationBehavior;
    },
  ): Promise<Stripe.Subscription> {
    const client = this.assertConfigured();

    try {
      const subscription = await client.subscriptions.retrieve(subscriptionId);
      const itemId = subscription.items.data[0]?.id;

      if (!itemId) {
        throw new Error(
          `Subscription ${subscriptionId} has no items to update`,
        );
      }

      return await client.subscriptions.update(subscriptionId, {
        items: [{ id: itemId, price: params.priceId }],
        proration_behavior: params.prorationBehavior ?? 'always_invoice',
      });
    } catch (error) {
      this.logger.error(
        { error, subscriptionId, params },
        'Failed to update Stripe subscription',
      );
      throw this.wrapStripeError(error);
    }
  }

  async cancelSubscription(
    subscriptionId: string,
    params: { immediately?: boolean },
  ): Promise<Stripe.Subscription> {
    const client = this.assertConfigured();

    try {
      if (params.immediately) {
        return await client.subscriptions.cancel(subscriptionId);
      }

      return await client.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (error) {
      this.logger.error(
        { error, subscriptionId, params },
        'Failed to cancel Stripe subscription',
      );
      throw this.wrapStripeError(error);
    }
  }

  async resumeSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    const client = this.assertConfigured();

    try {
      return await client.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });
    } catch (error) {
      this.logger.error(
        { error, subscriptionId },
        'Failed to resume Stripe subscription',
      );
      throw this.wrapStripeError(error);
    }
  }

  // --- Webhook verification ---

  constructEvent(payload: Buffer, signature: string): Stripe.Event {
    const client = this.assertConfigured();

    if (!this.webhookSecret) {
      throw new ServiceUnavailableException(
        'Stripe webhook secret is not configured. Set STRIPE_WEBHOOK_SECRET.',
      );
    }

    try {
      return client.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
    } catch (error) {
      this.logger.error({ error }, 'Failed to verify Stripe webhook signature');
      throw this.wrapStripeError(error);
    }
  }

  // --- Price management ---

  async listPrices(productId: string): Promise<Stripe.Price[]> {
    const client = this.assertConfigured();

    try {
      const result = await client.prices.list({
        product: productId,
        active: true,
      });
      return result.data;
    } catch (error) {
      this.logger.error({ error, productId }, 'Failed to list Stripe prices');
      throw this.wrapStripeError(error);
    }
  }

  // --- Internal helpers ---

  private assertConfigured(): Stripe {
    if (!this.stripe) {
      throw new ServiceUnavailableException(
        'Stripe is not configured. Set STRIPE_SECRET_KEY.',
      );
    }
    return this.stripe;
  }

  private isStripeNotFoundError(error: unknown): boolean {
    return (
      error instanceof Stripe.errors.StripeError && error.statusCode === 404
    );
  }

  private wrapStripeError(error: unknown): Error {
    if (error instanceof ServiceUnavailableException) {
      return error;
    }
    if (error instanceof Stripe.errors.StripeError) {
      return new Error(`Stripe API error: ${error.message}`);
    }
    if (error instanceof Error) {
      return error;
    }
    return new Error('Unknown Stripe error');
  }
}
