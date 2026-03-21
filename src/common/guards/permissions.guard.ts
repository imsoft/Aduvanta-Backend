import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PermissionsService } from '../../modules/permissions/permissions.service.js';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator.js';
import type { ActiveSession } from '../types/session.types.js';
import type { Permission } from '../../modules/permissions/permission.codes.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<
      Permission | undefined
    >(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermission) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { activeSession?: ActiveSession }>();

    if (!request.activeSession) {
      throw new UnauthorizedException('No active session');
    }

    // Extract organizationId from route param or header — never fall back to generic 'id'.
    const organizationId =
      (request.params as Record<string, string>)['organizationId'] ??
      (typeof request.headers['x-organization-id'] === 'string'
        ? request.headers['x-organization-id']
        : undefined);

    if (!organizationId || typeof organizationId !== 'string') {
      throw new ForbiddenException('Organization context is required');
    }

    // Validate UUID format to prevent injection via header.
    const UUID_RE =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(organizationId)) {
      throw new ForbiddenException('Invalid organization identifier');
    }

    await this.permissionsService.assertPermission(
      request.activeSession.user.id,
      organizationId,
      requiredPermission,
    );

    return true;
  }
}
