import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { CustomsOperationsRepository } from './customs-operations.repository.js';
import { CustomsOperationsService } from './customs-operations.service.js';
import { CustomsOperationsController } from './customs-operations.controller.js';

@Module({
  imports: [AuthModule],
  providers: [
    CustomsOperationsRepository,
    CustomsOperationsService,
    PermissionsGuard,
  ],
  controllers: [CustomsOperationsController],
  exports: [CustomsOperationsService],
})
export class CustomsOperationsModule {}
