import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { AppConfigService } from '../config/config.service.js';
import * as schema from './schema/index.js';

export const DATABASE = Symbol('DATABASE');

export type AppSchema = typeof schema;
export type Database = NodePgDatabase<AppSchema>;

@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: (config: AppConfigService): Database => {
        const pool = new Pool({
          connectionString: config.get('DATABASE_URL'),
          ssl: { rejectUnauthorized: false },
        });
        return drizzle(pool, { schema });
      },
      inject: [AppConfigService],
    },
  ],
  exports: [DATABASE],
})
export class DatabaseModule {}
