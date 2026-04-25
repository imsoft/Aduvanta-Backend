import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { SystemAdminRepository } from './system-admin.repository.js';
import { SystemAdminService } from './system-admin.service.js';
import { SystemAdminController } from './system-admin.controller.js';

@Global()
@Module({
  imports: [AuthModule],
  providers: [SystemAdminRepository, SystemAdminService],
  controllers: [SystemAdminController],
  exports: [SystemAdminService],
})
export class SystemAdminModule {}
