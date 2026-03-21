import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { AbuseDetectionService } from './abuse-detection.service'
import type { Request } from 'express'

type ActiveSession = {
  session: { userId: string }
}

/**
 * Guard that blocks requests from IPs or users with a critical abuse score.
 *
 * Runs early in the guard chain. If the identifier is blocked, the request
 * is immediately rejected with 403.
 */
@Injectable()
export class AbuseDetectionGuard implements CanActivate {
  private readonly logger = new Logger(AbuseDetectionGuard.name)

  constructor(
    private readonly abuseDetectionService: AbuseDetectionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()

    const ip = this.extractIp(request)
    const session = (request as Request & { activeSession?: ActiveSession })
      .activeSession
    const userId = session?.session.userId

    // Check IP block
    const ipBlocked = await this.abuseDetectionService.isBlocked(ip)
    if (ipBlocked) {
      this.logger.warn({ ip, path: request.path }, 'Blocked IP attempted access')
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Access temporarily restricted. Please try again later.',
        },
        HttpStatus.FORBIDDEN,
      )
    }

    // Check user block
    if (userId) {
      const userBlocked = await this.abuseDetectionService.isBlocked(userId)
      if (userBlocked) {
        this.logger.warn(
          { userId, ip, path: request.path },
          'Blocked user attempted access',
        )
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            message: 'Your account has been temporarily restricted due to unusual activity.',
          },
          HttpStatus.FORBIDDEN,
        )
      }
    }

    return true
  }

  private extractIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for']
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim()
    }
    return req.ip ?? req.socket.remoteAddress ?? 'unknown'
  }
}
