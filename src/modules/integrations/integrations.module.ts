import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { IntegrationsRepository } from './integrations.repository.js';
import { IntegrationsService } from './integrations.service.js';
import { IntegrationsController } from './integrations.controller.js';

@Module({
  imports: [AuthModule],
  providers: [IntegrationsRepository, IntegrationsService],
  controllers: [IntegrationsController],
  exports: [IntegrationsRepository, IntegrationsService],
})
export class IntegrationsModule {}
