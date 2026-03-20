import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { CustomsEntriesRepository } from './customs-entries.repository.js';
import { CustomsEntriesService } from './customs-entries.service.js';
import { CustomsEntriesController } from './customs-entries.controller.js';

@Module({
  imports: [AuthModule],
  providers: [
    CustomsEntriesRepository,
    CustomsEntriesService,
    PermissionsGuard,
  ],
  controllers: [CustomsEntriesController],
  exports: [CustomsEntriesService],
})
export class CustomsEntriesModule {}
