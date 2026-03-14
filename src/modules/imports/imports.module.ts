import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ClientsModule } from '../clients/clients.module.js';
import { ImportsRepository } from './imports.repository.js';
import { ImportsService } from './imports.service.js';
import { ImportsController } from './imports.controller.js';

@Module({
  imports: [AuthModule, ClientsModule],
  providers: [ImportsRepository, ImportsService],
  controllers: [ImportsController],
  exports: [ImportsService],
})
export class ImportsModule {}
