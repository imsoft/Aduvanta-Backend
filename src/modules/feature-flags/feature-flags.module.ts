import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { FeatureFlagsRepository } from './feature-flags.repository.js';
import { FeatureFlagsService } from './feature-flags.service.js';
import { FeatureFlagsController } from './feature-flags.controller.js';

@Module({
  imports: [AuthModule, AuditLogsModule],
  providers: [FeatureFlagsRepository, FeatureFlagsService],
  controllers: [FeatureFlagsController],
  exports: [FeatureFlagsRepository, FeatureFlagsService],
})
export class FeatureFlagsModule {}
