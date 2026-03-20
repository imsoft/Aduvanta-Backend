import { Injectable, NotFoundException } from '@nestjs/common';
import { IntegrationsService } from '../integrations/integrations.service.js';
import type { DeliveryRecord } from './integration-deliveries.repository.js';
import { IntegrationDeliveriesRepository } from './integration-deliveries.repository.js';
import { WebhookDeliveryService } from './webhook-delivery.service.js';
import type { ListIntegrationDeliveriesDto } from './dto/list-integration-deliveries.dto.js';

@Injectable()
export class IntegrationDeliveriesService {
  constructor(
    private readonly deliveriesRepository: IntegrationDeliveriesRepository,
    private readonly integrationsService: IntegrationsService,
    private readonly webhookDeliveryService: WebhookDeliveryService,
  ) {}

  async listForIntegration(
    integrationId: string,
    organizationId: string,
    dto: ListIntegrationDeliveriesDto,
  ): Promise<DeliveryRecord[]> {
    await this.integrationsService.getById(integrationId, organizationId);

    return this.deliveriesRepository.findByIntegration({
      integrationId,
      organizationId,
      status: dto.status,
    });
  }

  async getById(id: string, organizationId: string): Promise<DeliveryRecord> {
    const record = await this.deliveriesRepository.findById(id);

    if (!record || record.organizationId !== organizationId) {
      throw new NotFoundException(`Delivery ${id} not found`);
    }

    return record;
  }

  async retry(
    deliveryId: string,
    organizationId: string,
    actorId: string,
  ): Promise<DeliveryRecord> {
    return this.webhookDeliveryService.retry(
      deliveryId,
      organizationId,
      actorId,
    );
  }
}
