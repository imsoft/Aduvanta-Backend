import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import { UsersRepository } from '../users/users.repository.js';
import type { MemberWithUser } from './memberships.repository.js';
import { MembershipsRepository } from './memberships.repository.js';
import type { MembershipRole } from '../../database/schema/index.js';

@Injectable()
export class MembershipsService {
  constructor(
    private readonly membershipsRepository: MembershipsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async listMembers(organizationId: string): Promise<MemberWithUser[]> {
    return this.membershipsRepository.findByOrganization(organizationId);
  }

  async addMember(
    organizationId: string,
    email: string,
    role: 'ADMIN' | 'MEMBER',
    actorId: string,
  ): Promise<MemberWithUser> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`No user found with email ${email}`);
    }

    const existing = await this.membershipsRepository.findByUserAndOrg(
      user.id,
      organizationId,
    );

    if (existing) {
      throw new ConflictException('User is already a member of this organization');
    }

    const membership = await this.membershipsRepository.insert({
      organizationId,
      userId: user.id,
      role,
    });

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.MEMBER_INVITED,
      resource: 'membership',
      resourceId: membership.id,
      metadata: { email, role, userId: user.id },
    });

    return { membership, user: { id: user.id, name: user.name, email: user.email } };
  }

  async updateMemberRole(
    organizationId: string,
    targetUserId: string,
    role: 'ADMIN' | 'MEMBER',
    actorId: string,
  ): Promise<MemberWithUser> {
    if (targetUserId === actorId) {
      throw new BadRequestException('You cannot change your own role');
    }

    const target = await this.membershipsRepository.findByUserAndOrg(
      targetUserId,
      organizationId,
    );

    if (!target) {
      throw new NotFoundException('Member not found in this organization');
    }

    if (target.role === 'OWNER') {
      throw new BadRequestException('The owner role cannot be changed');
    }

    const updated = await this.membershipsRepository.updateRole(
      organizationId,
      targetUserId,
      role as MembershipRole,
    );

    if (!updated) {
      throw new NotFoundException('Member not found');
    }

    const user = await this.usersRepository.findById(targetUserId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.MEMBER_ROLE_UPDATED,
      resource: 'membership',
      resourceId: updated.id,
      metadata: { userId: targetUserId, previousRole: target.role, newRole: role },
    });

    return { membership: updated, user: { id: user.id, name: user.name, email: user.email } };
  }

  async removeMember(
    organizationId: string,
    targetUserId: string,
    actorId: string,
  ): Promise<void> {
    if (targetUserId === actorId) {
      throw new BadRequestException('You cannot remove yourself from the organization');
    }

    const target = await this.membershipsRepository.findByUserAndOrg(
      targetUserId,
      organizationId,
    );

    if (!target) {
      throw new NotFoundException('Member not found in this organization');
    }

    if (target.role === 'OWNER') {
      throw new BadRequestException('The owner cannot be removed');
    }

    await this.membershipsRepository.deleteByOrgAndUser(organizationId, targetUserId);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.MEMBER_REMOVED,
      resource: 'membership',
      resourceId: target.id,
      metadata: { userId: targetUserId },
    });
  }
}
