import { Global, Module } from '@nestjs/common';
import { SystemAdminRepository } from './system-admin.repository.js';
import { SystemAdminService } from './system-admin.service.js';

@Global()
@Module({
  providers: [SystemAdminRepository, SystemAdminService],
  exports: [SystemAdminService],
})
export class SystemAdminModule {}
