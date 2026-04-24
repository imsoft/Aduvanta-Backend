import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { CustomsRectificationsRepository } from './customs-rectifications.repository.js';
import { CustomsRectificationsService } from './customs-rectifications.service.js';
import { CustomsRectificationsController } from './customs-rectifications.controller.js';

@Module({
  imports: [AuthModule],
  providers: [
    CustomsRectificationsRepository,
    CustomsRectificationsService,
    PermissionsGuard,
  ],
  controllers: [CustomsRectificationsController],
  exports: [CustomsRectificationsService],
})
export class CustomsRectificationsModule {}
