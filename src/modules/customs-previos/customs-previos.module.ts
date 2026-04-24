import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { CustomsPreviosRepository } from './customs-previos.repository.js';
import { CustomsPreviosService } from './customs-previos.service.js';
import { CustomsPreviosController } from './customs-previos.controller.js';

@Module({
  imports: [AuthModule],
  providers: [CustomsPreviosRepository, CustomsPreviosService, PermissionsGuard],
  controllers: [CustomsPreviosController],
  exports: [CustomsPreviosService],
})
export class CustomsPreviosModule {}
