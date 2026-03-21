import { Global, Module, MiddlewareConsumer, NestModule } from '@nestjs/common'
import { RateLimitService } from './rate-limit.service'
import { RateLimitGuard } from './rate-limit.guard'
import { IpRateLimitMiddleware } from './ip-rate-limit.middleware'
import { AbuseDetectionService } from '../abuse-detection/abuse-detection.service'
import { AbuseDetectionGuard } from '../abuse-detection/abuse-detection.guard'
import { AbuseSignalInterceptor } from '../abuse-detection/abuse-signal.interceptor'
import { IdempotencyGuard } from '../idempotency/idempotency.guard'
import { IdempotencyInterceptor } from '../idempotency/idempotency.interceptor'

@Global()
@Module({
  providers: [
    RateLimitService,
    RateLimitGuard,
    AbuseDetectionService,
    AbuseDetectionGuard,
    AbuseSignalInterceptor,
    IdempotencyGuard,
    IdempotencyInterceptor,
  ],
  exports: [
    RateLimitService,
    RateLimitGuard,
    AbuseDetectionService,
    AbuseDetectionGuard,
    AbuseSignalInterceptor,
    IdempotencyGuard,
    IdempotencyInterceptor,
  ],
})
export class RateLimitModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IpRateLimitMiddleware).forRoutes('*')
  }
}
