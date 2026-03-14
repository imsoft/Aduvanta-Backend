import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  // Point directly to app schema files — Better Auth manages its own schema.
  // Avoids the barrel index.ts which uses .js extensions drizzle-kit cannot resolve.
  schema: './src/database/schema/!(auth).schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Exclude Better Auth tables from migrations so drizzle-kit does not
  // attempt to create or modify them.
  tablesFilter: ['!user', '!session', '!account', '!verification'],
});
