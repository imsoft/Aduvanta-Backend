import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ClientsModule } from '../clients/clients.module.js';
import { ClientContactsRepository } from './client-contacts.repository.js';
import { ClientContactsService } from './client-contacts.service.js';
import { ClientContactsController } from './client-contacts.controller.js';

@Module({
  imports: [AuthModule, ClientsModule],
  providers: [ClientContactsRepository, ClientContactsService],
  controllers: [ClientContactsController],
})
export class ClientContactsModule {}
