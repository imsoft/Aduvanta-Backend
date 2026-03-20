import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { TariffClassificationRepository } from './tariff-classification.repository.js';
import { TariffClassificationService } from './tariff-classification.service.js';
import { TariffClassificationController } from './tariff-classification.controller.js';

@Module({
  imports: [AuthModule],
  providers: [
    TariffClassificationRepository,
    TariffClassificationService,
    PermissionsGuard,
  ],
  controllers: [TariffClassificationController],
  exports: [TariffClassificationService],
})
export class TariffClassificationModule {}
