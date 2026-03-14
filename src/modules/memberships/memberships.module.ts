import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';
import { MembershipsRepository } from './memberships.repository.js';
import { MembershipsService } from './memberships.service.js';
import { MembershipsController } from './memberships.controller.js';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [MembershipsRepository, MembershipsService],
  controllers: [MembershipsController],
  exports: [MembershipsRepository, MembershipsService],
})
export class MembershipsModule {}
