import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { CustomsValuationRepository } from './customs-valuation.repository.js';
import { CustomsValuationService } from './customs-valuation.service.js';
import { CustomsValuationController } from './customs-valuation.controller.js';

@Module({
  imports: [AuthModule],
  providers: [
    CustomsValuationRepository,
    CustomsValuationService,
    PermissionsGuard,
  ],
  controllers: [CustomsValuationController],
  exports: [CustomsValuationService],
})
export class CustomsValuationModule {}
