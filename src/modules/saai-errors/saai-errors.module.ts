import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { SaaiErrorsController } from './saai-errors.controller.js';
import { SaaiErrorsService } from './saai-errors.service.js';
import { SaaiErrorsRepository } from './saai-errors.repository.js';

@Module({
  imports: [AuthModule],
  controllers: [SaaiErrorsController],
  providers: [SaaiErrorsService, SaaiErrorsRepository],
  exports: [SaaiErrorsService],
})
export class SaaiErrorsModule {}
