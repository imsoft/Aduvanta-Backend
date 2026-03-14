import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { UsersRepository } from './users.repository.js';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';

@Module({
  imports: [AuthModule],
  providers: [UsersRepository, UsersService],
  controllers: [UsersController],
  exports: [UsersRepository, UsersService],
})
export class UsersModule {}
