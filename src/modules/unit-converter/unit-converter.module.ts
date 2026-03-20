import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { UnitConverterService } from './unit-converter.service.js';
import { UnitConverterController } from './unit-converter.controller.js';

@Module({
  imports: [AuthModule],
  providers: [UnitConverterService],
  controllers: [UnitConverterController],
  exports: [UnitConverterService],
})
export class UnitConverterModule {}
