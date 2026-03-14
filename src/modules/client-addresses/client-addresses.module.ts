import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ClientsModule } from '../clients/clients.module.js';
import { ClientAddressesRepository } from './client-addresses.repository.js';
import { ClientAddressesService } from './client-addresses.service.js';
import { ClientAddressesController } from './client-addresses.controller.js';

@Module({
  imports: [AuthModule, ClientsModule],
  providers: [ClientAddressesRepository, ClientAddressesService],
  controllers: [ClientAddressesController],
})
export class ClientAddressesModule {}
