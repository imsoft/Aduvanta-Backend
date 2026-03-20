import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ClientPortalAccessModule } from '../client-portal-access/client-portal-access.module.js';
import { OperationsModule } from '../operations/operations.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { PortalRepository } from './portal.repository.js';
import { PortalService } from './portal.service.js';
import { PortalController } from './portal.controller.js';

@Module({
  imports: [
    AuthModule,
    ClientPortalAccessModule,
    OperationsModule,
    StorageModule,
  ],
  providers: [PortalRepository, PortalService],
  controllers: [PortalController],
})
export class PortalModule {}
