import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { MembershipsModule } from '../memberships/memberships.module.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { OrganizationsRepository } from './organizations.repository.js';
import { OrganizationsService } from './organizations.service.js';
import { OrganizationsController } from './organizations.controller.js';

@Module({
  imports: [AuthModule, MembershipsModule],
  providers: [OrganizationsRepository, OrganizationsService, PermissionsGuard],
  controllers: [OrganizationsController],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
