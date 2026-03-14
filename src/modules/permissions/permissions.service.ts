import { ForbiddenException, Injectable } from '@nestjs/common';
import { MembershipsRepository } from '../memberships/memberships.repository.js';
import { ROLE_PERMISSIONS } from './permission.map.js';
import type { Permission } from './permission.codes.js';

@Injectable()
export class PermissionsService {
  constructor(private readonly membershipsRepository: MembershipsRepository) {}

  async hasPermission(
    userId: string,
    organizationId: string,
    code: Permission,
  ): Promise<boolean> {
    const membership = await this.membershipsRepository.findByUserAndOrg(
      userId,
      organizationId,
    );

    if (!membership) {
      return false;
    }

    return (ROLE_PERMISSIONS[membership.role] as readonly string[]).includes(
      code,
    );
  }

  async assertPermission(
    userId: string,
    organizationId: string,
    code: Permission,
  ): Promise<void> {
    const allowed = await this.hasPermission(userId, organizationId, code);

    if (!allowed) {
      throw new ForbiddenException(`Missing permission: ${code}`);
    }
  }
}
