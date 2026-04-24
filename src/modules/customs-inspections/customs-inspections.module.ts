import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { CustomsInspectionsRepository } from './customs-inspections.repository.js';
import { CustomsInspectionsService } from './customs-inspections.service.js';
import { CustomsInspectionsController } from './customs-inspections.controller.js';

@Module({
  imports: [AuthModule],
  providers: [
    CustomsInspectionsRepository,
    CustomsInspectionsService,
    PermissionsGuard,
  ],
  controllers: [CustomsInspectionsController],
  exports: [CustomsInspectionsService],
})
export class CustomsInspectionsModule {}
