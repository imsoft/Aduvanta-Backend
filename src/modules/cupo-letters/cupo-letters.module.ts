import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { CupoLettersRepository } from './cupo-letters.repository.js';
import { CupoLettersService } from './cupo-letters.service.js';
import { CupoLettersController } from './cupo-letters.controller.js';

@Module({
  imports: [AuthModule],
  providers: [CupoLettersRepository, CupoLettersService, PermissionsGuard],
  controllers: [CupoLettersController],
  exports: [CupoLettersService],
})
export class CupoLettersModule {}
