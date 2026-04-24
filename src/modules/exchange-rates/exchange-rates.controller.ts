import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator.js';
import { RateLimitGuard } from '../../common/rate-limit/rate-limit.guard.js';
import { ExchangeRatesService } from './exchange-rates.service.js';

@RateLimit('search')
@Controller('exchange-rates')
@UseGuards(AuthGuard, RateLimitGuard)
export class ExchangeRatesController {
  constructor(private readonly service: ExchangeRatesService) {}

  @Get('market')
  getMarketRates(@Query('base') base = 'MXN') {
    return this.service.getMarketRates(base);
  }

  @Get('fix')
  getFixRate() {
    return this.service.getFixRate();
  }
}
