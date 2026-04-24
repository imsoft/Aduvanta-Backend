import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { SaaiGeneratorService } from './saai-generator.service.js';
import { SaaiGeneratorController } from './saai-generator.controller.js';

@Module({
  imports: [AuthModule],
  providers: [SaaiGeneratorService, PermissionsGuard],
  controllers: [SaaiGeneratorController],
  exports: [SaaiGeneratorService],
})
export class SaaiGeneratorModule {}
