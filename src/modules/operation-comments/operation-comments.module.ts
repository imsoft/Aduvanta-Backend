import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { OperationsModule } from '../operations/operations.module.js';
import { OperationCommentsRepository } from './operation-comments.repository.js';
import { OperationCommentsService } from './operation-comments.service.js';
import { OperationCommentsController } from './operation-comments.controller.js';

@Module({
  imports: [AuthModule, OperationsModule],
  providers: [OperationCommentsRepository, OperationCommentsService],
  controllers: [OperationCommentsController],
})
export class OperationCommentsModule {}
