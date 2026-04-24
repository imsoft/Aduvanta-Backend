import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS } from '../../redis/redis.module.js';
import { AppConfigService } from '../../config/config.service.js';

export interface MarketRatesResponse {
  base: string;
  rates: Record<string, number>;
  updatedAt: string;
  source: 'cache' | 'live';
}

export interface FixRateResponse {
  date: string;
  usdMxn: number;
  source: 'Banco de México (FIX)';
  note: string;
}

const MARKET_CACHE_TTL = 60 * 60 * 6; // 6 hours
const FIX_CACHE_TTL = 60 * 60 * 20;   // 20 hours (FIX publishes once per business day)

// Banxico series: FIX USD/MXN
const BANXICO_FIX_SERIES = 'SF43718';

@Injectable()
export class ExchangeRatesService {
  private readonly logger = new Logger(ExchangeRatesService.name);

  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    private readonly config: AppConfigService,
  ) {}

  async getMarketRates(base: string): Promise<MarketRatesResponse> {
    const normalizedBase = base.toUpperCase();
    const cacheKey = `exchange_rates:market:${normalizedBase}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as MarketRatesResponse;
        return { ...parsed, source: 'cache' };
      }
    } catch {
      this.logger.warn('Redis unavailable, fetching live market rates');
    }

    const apiKey = this.config.get('EXCHANGE_RATE_API_KEY');
    if (!apiKey) throw new Error('EXCHANGE_RATE_API_KEY is not configured');
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${normalizedBase}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`ExchangeRate-API error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as {
      result: string;
      base_code: string;
      rates: Record<string, number>;
      time_last_update_utc: string;
    };

    if (data.result !== 'success') {
      throw new Error(`ExchangeRate-API returned non-success result`);
    }

    const payload: MarketRatesResponse = {
      base: data.base_code,
      rates: data.rates,
      updatedAt: data.time_last_update_utc,
      source: 'live',
    };

    try {
      await this.redis.set(cacheKey, JSON.stringify(payload), 'EX', MARKET_CACHE_TTL);
    } catch {
      this.logger.warn('Could not cache market rates in Redis');
    }

    return payload;
  }

  async getFixRate(): Promise<FixRateResponse> {
    const cacheKey = 'exchange_rates:banxico:fix';

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached) as FixRateResponse;
    } catch {
      this.logger.warn('Redis unavailable, fetching live FIX rate');
    }

    const token = this.config.get('BANXICO_TOKEN');
    if (!token) throw new Error('BANXICO_TOKEN is not configured');
    const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${BANXICO_FIX_SERIES}/datos/oportuno`;

    const res = await fetch(url, {
      headers: {
        'Bmx-Token': token,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Banxico API error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as {
      bmx: {
        series: Array<{
          datos: Array<{ fecha: string; dato: string }>;
        }>;
      };
    };

    const entry = data.bmx?.series?.[0]?.datos?.[0];
    if (!entry) {
      throw new Error('Banxico returned no data for FIX series SF43718');
    }

    // dato may be "N/E" on holidays
    const rate = parseFloat(entry.dato);
    if (isNaN(rate)) {
      throw new Error(`Banxico FIX rate is not a number: "${entry.dato}"`);
    }

    const payload: FixRateResponse = {
      date: entry.fecha,
      usdMxn: rate,
      source: 'Banco de México (FIX)',
      note: 'Tipo de cambio FIX publicado por el Banco de México. Obligatorio para valuar mercancías en pedimentos de importación/exportación (Art. 20 CFF).',
    };

    try {
      await this.redis.set(cacheKey, JSON.stringify(payload), 'EX', FIX_CACHE_TTL);
    } catch {
      this.logger.warn('Could not cache FIX rate in Redis');
    }

    return payload;
  }
}
