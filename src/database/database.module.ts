import {
  Global,
  Module,
  type OnApplicationShutdown,
  Inject,
} from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { AppConfigService } from '../config/config.service.js';
import * as schema from './schema/index.js';

export const DATABASE = Symbol('DATABASE');
export const DATABASE_POOL = Symbol('DATABASE_POOL');

export type AppSchema = typeof schema;
export type Database = NodePgDatabase<AppSchema>;

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      useFactory: (config: AppConfigService): Pool => {
        return new Pool({
          connectionString: config.get('DATABASE_URL'),
          ssl: true,
          // Cap the pool so a burst of traffic cannot exhaust the remote
          // database (Neon enforces its own limits; staying under them
          // avoids "too many connections" outages).
          max: config.get('PG_POOL_MAX'),
          statement_timeout: 30_000,
          idle_in_transaction_session_timeout: 60_000,
        });
      },
      inject: [AppConfigService],
    },
    {
      provide: DATABASE,
      useFactory: (pool: Pool): Database => drizzle(pool, { schema }),
      inject: [DATABASE_POOL],
    },
  ],
  exports: [DATABASE, DATABASE_POOL],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
