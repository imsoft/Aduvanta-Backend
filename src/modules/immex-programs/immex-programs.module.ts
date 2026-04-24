import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { ImmexProgramsRepository } from './immex-programs.repository.js';
import { ImmexProgramsService } from './immex-programs.service.js';
import { ImmexProgramsController } from './immex-programs.controller.js';

@Module({
  imports: [AuthModule],
  providers: [ImmexProgramsRepository, ImmexProgramsService, PermissionsGuard],
  controllers: [ImmexProgramsController],
  exports: [ImmexProgramsService],
})
export class ImmexProgramsModule {}
