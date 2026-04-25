import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import type { ActiveSession } from '../types/session.types.js';

@Injectable()
export class SystemAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { activeSession: ActiveSession }>();

    if (!request.activeSession?.isSystemAdmin) {
      throw new ForbiddenException('System admin access required');
    }

    return true;
  }
}
