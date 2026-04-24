import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ExchangeRatesService } from './exchange-rates.service.js';
import { ExchangeRatesController } from './exchange-rates.controller.js';

@Module({
  imports: [AuthModule],
  providers: [ExchangeRatesService],
  controllers: [ExchangeRatesController],
  exports: [ExchangeRatesService],
})
export class ExchangeRatesModule {}
