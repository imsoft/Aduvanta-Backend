import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { ClientsModule } from '../clients/clients.module.js';
import { OperationsModule } from '../operations/operations.module.js';
import { ExportsRepository } from './exports.repository.js';
import { ExportsService } from './exports.service.js';
import { ExportsController } from './exports.controller.js';

@Module({
  imports: [AuthModule, StorageModule, ClientsModule, OperationsModule],
  providers: [ExportsRepository, ExportsService],
  controllers: [ExportsController],
  exports: [ExportsService],
})
export class ExportsModule {}
