import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { TreasuryRepository } from './treasury.repository.js';
import { TreasuryService } from './treasury.service.js';
import { TreasuryController } from './treasury.controller.js';

@Module({
  imports: [AuthModule],
  providers: [TreasuryRepository, TreasuryService, PermissionsGuard],
  controllers: [TreasuryController],
  exports: [TreasuryService],
})
export class TreasuryModule {}
