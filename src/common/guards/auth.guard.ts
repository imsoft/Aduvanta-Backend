import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { getBetterAuthNode } from '../better-auth-node.loader.js';
import type { Request } from 'express';
import { BETTER_AUTH } from '../../modules/auth/auth.constants.js';
import type { BetterAuth } from '../../modules/auth/auth.types.js';
import { SystemAdminService } from '../../modules/system-admin/system-admin.service.js';
import type { ActiveSession } from '../types/session.types.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(BETTER_AUTH) private readonly auth: BetterAuth,
    private readonly systemAdminService: SystemAdminService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const { fromNodeHeaders } = await getBetterAuthNode();

    const session = (await this.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    })) as Omit<ActiveSession, 'isSystemAdmin'> | null;

    if (!session) {
      throw new UnauthorizedException('No active session');
    }

    const isSystemAdmin = await this.systemAdminService.isSystemAdmin(
      session.user.id,
    );

    (request as Request & { activeSession: ActiveSession }).activeSession = {
      ...session,
      isSystemAdmin,
    };

    return true;
  }
}
