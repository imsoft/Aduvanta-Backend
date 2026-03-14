import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ClientsModule } from '../clients/clients.module.js';
import { ClientPortalAccessRepository } from './client-portal-access.repository.js';
import { ClientPortalAccessService } from './client-portal-access.service.js';
import { ClientPortalAccessController } from './client-portal-access.controller.js';

@Module({
  imports: [AuthModule, ClientsModule],
  providers: [ClientPortalAccessRepository, ClientPortalAccessService],
  controllers: [ClientPortalAccessController],
  exports: [ClientPortalAccessRepository, ClientPortalAccessService],
})
export class ClientPortalAccessModule {}
