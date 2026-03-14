import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ClientsRepository } from './clients.repository.js';
import { ClientsService } from './clients.service.js';
import { ClientsController } from './clients.controller.js';

@Module({
  imports: [AuthModule],
  providers: [ClientsRepository, ClientsService],
  controllers: [ClientsController],
  exports: [ClientsRepository, ClientsService],
})
export class ClientsModule {}
