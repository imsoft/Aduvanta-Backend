import { Inject, Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicator,
  HealthCheckError,
} from '@nestjs/terminus';
import { sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module.js';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.db.execute(sql`SELECT 1`);
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        'Database health check failed',
        this.getStatus(key, false, {
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
      );
    }
  }
}
