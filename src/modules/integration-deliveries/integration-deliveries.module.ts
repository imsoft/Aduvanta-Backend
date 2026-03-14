import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { IntegrationsModule } from '../integrations/integrations.module.js';
import { IntegrationDeliveriesRepository } from './integration-deliveries.repository.js';
import { WebhookDeliveryService } from './webhook-delivery.service.js';
import { IntegrationDeliveriesService } from './integration-deliveries.service.js';
import { IntegrationDeliveriesController } from './integration-deliveries.controller.js';

@Module({
  imports: [AuthModule, IntegrationsModule],
  providers: [
    IntegrationDeliveriesRepository,
    WebhookDeliveryService,
    IntegrationDeliveriesService,
  ],
  controllers: [IntegrationDeliveriesController],
  exports: [WebhookDeliveryService, IntegrationDeliveriesService],
})
export class IntegrationDeliveriesModule {}
