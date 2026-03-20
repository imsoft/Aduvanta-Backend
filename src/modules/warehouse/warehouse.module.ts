import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { WarehouseRepository } from './warehouse.repository.js';
import { WarehouseService } from './warehouse.service.js';
import { WarehouseController } from './warehouse.controller.js';

@Module({
  imports: [AuthModule],
  providers: [WarehouseRepository, WarehouseService, PermissionsGuard],
  controllers: [WarehouseController],
  exports: [WarehouseService],
})
export class WarehouseModule {}
