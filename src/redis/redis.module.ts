import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../config/config.service.js';

export const REDIS = Symbol('REDIS');

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: (config: AppConfigService): Redis => {
        return new Redis(config.get('REDIS_URL'), {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });
      },
      inject: [AppConfigService],
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
