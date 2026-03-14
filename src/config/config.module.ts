import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configSchema } from './config.schema.js';
import { AppConfigService } from './config.service.js';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env: Record<string, unknown>) => {
        const result = configSchema.safeParse(env);
        if (!result.success) {
          throw new Error(`Config validation failed:\n${result.error.message}`);
        }
        return result.data;
      },
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
