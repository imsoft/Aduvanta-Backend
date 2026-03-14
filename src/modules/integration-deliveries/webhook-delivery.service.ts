import { Injectable } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import { IntegrationsRepository } from '../integrations/integrations.repository.js';
import type { DeliveryRecord } from './integration-deliveries.repository.js';
import { IntegrationDeliveriesRepository } from './integration-deliveries.repository.js';

export interface WebhookEventPayload {
  eventType: string;
  organizationId: string;
  occurredAt: string;
  resourceType: string;
  resourceId: string;
  data: Record<string, unknown>;
}

@Injectable()
export class WebhookDeliveryService {
  constructor(
    @InjectPinoLogger(WebhookDeliveryService.name)
    private readonly logger: PinoLogger,
    private readonly integrationsRepository: IntegrationsRepository,
    private readonly deliveriesRepository: IntegrationDeliveriesRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  /**
   * Emit an event to all active integrations subscribed to the given event type.
   * Creates a delivery record per matching integration and dispatches the HTTP call.
   */
  async emit(payload: WebhookEventPayload): Promise<void> {
    const integrations =
      await this.integrationsRepository.findActiveByOrganizationAndEventType(
        payload.organizationId,
        payload.eventType,
      );

    if (integrations.length === 0) {
      return;
    }

    await Promise.allSettled(
      integrations.map((integration) =>
        this.dispatchToIntegration(integration, payload),
      ),
    );
  }

  /**
   * Retry a single delivery by re-sending the original payload.
   */
  async retry(deliveryId: string, organizationId: string, actorId: string): Promise<DeliveryRecord> {
    const delivery = await this.deliveriesRepository.findById(deliveryId);

    if (!delivery || delivery.organizationId !== organizationId) {
      throw new Error(`Delivery ${deliveryId} not found`);
    }

    const integration = await this.integrationsRepository.findById(delivery.integrationId);

    if (!integration || integration.organizationId !== organizationId) {
      throw new Error(`Integration for delivery ${deliveryId} not found`);
    }

    const payload = JSON.parse(delivery.payloadJson) as WebhookEventPayload;
    const result = await this.sendHttpRequest(integration.targetUrl!, payload);

    const updated = await this.deliveriesRepository.update(deliveryId, organizationId, {
      status: result.success ? 'SUCCESS' : 'FAILED',
      responseStatus: result.status ?? null,
      responseBody: result.body ?? null,
      attemptCount: delivery.attemptCount + 1,
      lastAttemptAt: new Date(),
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: result.success
        ? AUDIT_ACTION.INTEGRATION_DELIVERY_RETRIED
        : AUDIT_ACTION.INTEGRATION_DELIVERY_FAILED,
      resource: 'integration_delivery',
      resourceId: deliveryId,
      metadata: {
        integrationId: delivery.integrationId,
        eventType: delivery.eventType,
        attemptCount: delivery.attemptCount + 1,
        responseStatus: result.status,
      },
    });

    return updated!;
  }

  private async dispatchToIntegration(
    integration: { id: string; organizationId: string; targetUrl: string | null },
    payload: WebhookEventPayload,
  ): Promise<void> {
    if (!integration.targetUrl) {
      this.logger.warn(
        { integrationId: integration.id },
        'Integration has no targetUrl — skipping delivery',
      );
      return;
    }

    const delivery = await this.deliveriesRepository.insert({
      organizationId: integration.organizationId,
      integrationId: integration.id,
      eventType: payload.eventType,
      payloadJson: JSON.stringify(payload),
      status: 'PENDING',
      attemptCount: 0,
    });

    const result = await this.sendHttpRequest(integration.targetUrl, payload);

    await this.deliveriesRepository.update(delivery.id, integration.organizationId, {
      status: result.success ? 'SUCCESS' : 'FAILED',
      responseStatus: result.status ?? null,
      responseBody: result.body ?? null,
      attemptCount: 1,
      lastAttemptAt: new Date(),
    });

    await this.auditLogsService.log({
      organizationId: integration.organizationId,
      actorId: 'system',
      action: result.success
        ? AUDIT_ACTION.INTEGRATION_DELIVERY_SENT
        : AUDIT_ACTION.INTEGRATION_DELIVERY_FAILED,
      resource: 'integration_delivery',
      resourceId: delivery.id,
      metadata: {
        integrationId: integration.id,
        eventType: payload.eventType,
        responseStatus: result.status,
      },
    });

    if (!result.success) {
      this.logger.warn(
        {
          integrationId: integration.id,
          deliveryId: delivery.id,
          eventType: payload.eventType,
          responseStatus: result.status,
        },
        'Webhook delivery failed',
      );
    }
  }

  private async sendHttpRequest(
    url: string,
    payload: WebhookEventPayload,
  ): Promise<{ success: boolean; status: number | null; body: string | null }> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });

      const body = await response.text().catch(() => null);

      return {
        success: response.ok,
        status: response.status,
        body: body ? body.slice(0, 2000) : null,
      };
    } catch (err: unknown) {
      this.logger.warn(
        { url, error: err instanceof Error ? err.message : String(err) },
        'Webhook HTTP request threw an error',
      );

      return { success: false, status: null, body: null };
    }
  }
}
