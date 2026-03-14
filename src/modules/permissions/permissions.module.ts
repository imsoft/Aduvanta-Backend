import { Global, Module } from '@nestjs/common';
import { MembershipsModule } from '../memberships/memberships.module.js';
import { PermissionsService } from './permissions.service.js';

@Global()
@Module({
  imports: [MembershipsModule],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
