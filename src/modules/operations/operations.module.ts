import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ClientsModule } from '../clients/clients.module.js';
import { MembershipsModule } from '../memberships/memberships.module.js';
import { OperationsRepository } from './operations.repository.js';
import { OperationsService } from './operations.service.js';
import { OperationsController } from './operations.controller.js';

@Module({
  imports: [AuthModule, ClientsModule, MembershipsModule],
  providers: [OperationsRepository, OperationsService],
  controllers: [OperationsController],
  exports: [OperationsRepository, OperationsService],
})
export class OperationsModule {}
