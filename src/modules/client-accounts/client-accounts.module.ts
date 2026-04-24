import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { ClientAccountsRepository } from './client-accounts.repository.js';
import { ClientAccountsService } from './client-accounts.service.js';
import { ClientAccountsController } from './client-accounts.controller.js';

@Module({
  imports: [AuthModule],
  providers: [ClientAccountsRepository, ClientAccountsService, PermissionsGuard],
  controllers: [ClientAccountsController],
  exports: [ClientAccountsService],
})
export class ClientAccountsModule {}
