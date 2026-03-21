import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AbuseDetectionService } from './abuse-detection.service';
import type { Request } from 'express';

type ActiveSession = {
  session: { userId: string };
};

/**
 * Interceptor that records abuse signals when requests result in
 * security-relevant HTTP errors (400, 403, 429).
 *
 * This allows the AbuseDetectionService to build a risk score per user/IP
 * without requiring manual signal recording in every controller.
 */
@Injectable()
export class AbuseSignalInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AbuseSignalInterceptor.name);

  constructor(
    private readonly abuseDetectionService: AbuseDetectionService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap({
        error: (error: unknown) => {
          if (!(error instanceof HttpException)) {
            return;
          }

          const status = error.getStatus();
          const request = context.switchToHttp().getRequest<Request>();
          const ip = this.extractIp(request);
          const session = (request as Request & { activeSession?: ActiveSession })
            .activeSession;

          const baseEvent = {
            userId: session?.session.userId,
            ip,
            path: request.url,
            method: request.method,
            userAgent: request.headers['user-agent'],
          };

          if (status === 429) {
            void this.abuseDetectionService.recordSignal({
              ...baseEvent,
              action: 'rate_limit_hit',
            });
          }

          if (status === 403) {
            void this.abuseDetectionService.recordSignal({
              ...baseEvent,
              action: 'forbidden',
            });
          }

          if (status === 400) {
            void this.abuseDetectionService.recordSignal({
              ...baseEvent,
              action: 'validation_error',
            });
          }
        },
      }),
    );
  }

  private extractIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip ?? req.socket.remoteAddress ?? 'unknown';
  }
}
