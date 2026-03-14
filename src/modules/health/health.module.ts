import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './database.health-indicator.js';
import { RedisHealthIndicator } from './redis.health-indicator.js';
import { HealthController } from './health.controller.js';

@Module({
  imports: [TerminusModule],
  providers: [DatabaseHealthIndicator, RedisHealthIndicator],
  controllers: [HealthController],
})
export class HealthModule {}
