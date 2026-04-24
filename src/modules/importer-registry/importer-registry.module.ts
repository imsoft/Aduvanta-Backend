import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { ImporterRegistryRepository } from './importer-registry.repository.js';
import { ImporterRegistryService } from './importer-registry.service.js';
import { ImporterRegistryController } from './importer-registry.controller.js';

@Module({
  imports: [AuthModule],
  providers: [ImporterRegistryRepository, ImporterRegistryService, PermissionsGuard],
  controllers: [ImporterRegistryController],
  exports: [ImporterRegistryService],
})
export class ImporterRegistryModule {}
