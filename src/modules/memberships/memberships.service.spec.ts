import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service.js';
import { MembershipsRepository } from './memberships.repository.js';
import { UsersRepository } from '../users/users.repository.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';

describe('MembershipsService', () => {
  let service: MembershipsService;
  let membershipsRepository: {
    findByOrganization: jest.Mock;
    findByUserAndOrg: jest.Mock;
    findOrganizationsByUserId: jest.Mock;
    insert: jest.Mock;
    updateRole: jest.Mock;
    deleteByOrgAndUser: jest.Mock;
  };
  let usersRepository: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
  };
  let auditLogsService: { log: jest.Mock };

  const actorId = 'actor-1';
  const targetUserId = 'target-1';
  const organizationId = 'org-1';

  const fakeUser = {
    id: targetUserId,
    name: 'Target User',
    email: 'target@example.com',
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function makeMembership(
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'CLIENT',
    overrides: Record<string, unknown> = {},
  ) {
    return {
      id: 'membership-1',
      organizationId,
      userId: targetUserId,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  beforeEach(async () => {
    membershipsRepository = {
      findByOrganization: jest.fn(),
      findByUserAndOrg: jest.fn(),
      findOrganizationsByUserId: jest.fn(),
      insert: jest.fn(),
      updateRole: jest.fn(),
      deleteByOrgAndUser: jest.fn(),
    };

    usersRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    auditLogsService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipsService,
        { provide: MembershipsRepository, useValue: membershipsRepository },
        { provide: UsersRepository, useValue: usersRepository },
        { provide: AuditLogsService, useValue: auditLogsService },
      ],
    }).compile();

    service = module.get<MembershipsService>(MembershipsService);
  });

  describe('listMembers', () => {
    it('should return members for the organization', async () => {
      const members = [{ membership: makeMembership('OWNER'), user: fakeUser }];
      membershipsRepository.findByOrganization.mockResolvedValue(members);

      const result = await service.listMembers(organizationId);

      expect(result).toEqual(members);
      expect(membershipsRepository.findByOrganization).toHaveBeenCalledWith(
        organizationId,
      );
    });

    it('should return empty array when organization has no members', async () => {
      membershipsRepository.findByOrganization.mockResolvedValue([]);

      const result = await service.listMembers(organizationId);

      expect(result).toEqual([]);
    });
  });

  describe('addMember', () => {
    it('should create membership and write audit log', async () => {
      const membership = makeMembership('MEMBER');
      usersRepository.findByEmail.mockResolvedValue(fakeUser);
      membershipsRepository.findByUserAndOrg.mockResolvedValue(undefined);
      membershipsRepository.insert.mockResolvedValue(membership);

      const result = await service.addMember(
        organizationId,
        fakeUser.email,
        'MEMBER',
        actorId,
      );

      expect(result).toEqual({
        membership,
        user: { id: fakeUser.id, name: fakeUser.name, email: fakeUser.email },
      });
      expect(membershipsRepository.insert).toHaveBeenCalledWith({
        organizationId,
        userId: fakeUser.id,
        role: 'MEMBER',
      });
      expect(auditLogsService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId,
          actorId,
          action: AUDIT_ACTION.MEMBER_INVITED,
          resource: 'membership',
          resourceId: membership.id,
          metadata: {
            email: fakeUser.email,
            role: 'MEMBER',
            userId: fakeUser.id,
          },
        }),
      );
    });

    it('should throw NotFoundException when user email is not found', async () => {
      usersRepository.findByEmail.mockResolvedValue(undefined);

      await expect(
        service.addMember(
          organizationId,
          'unknown@example.com',
          'MEMBER',
          actorId,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when user is already a member', async () => {
      usersRepository.findByEmail.mockResolvedValue(fakeUser);
      membershipsRepository.findByUserAndOrg.mockResolvedValue(
        makeMembership('MEMBER'),
      );

      await expect(
        service.addMember(organizationId, fakeUser.email, 'MEMBER', actorId),
      ).rejects.toThrow(ConflictException);
    });

    it('should not write audit log when membership creation fails due to conflict', async () => {
      usersRepository.findByEmail.mockResolvedValue(fakeUser);
      membershipsRepository.findByUserAndOrg.mockResolvedValue(
        makeMembership('MEMBER'),
      );

      await expect(
        service.addMember(organizationId, fakeUser.email, 'MEMBER', actorId),
      ).rejects.toThrow();

      expect(auditLogsService.log).not.toHaveBeenCalled();
    });
  });

  describe('updateMemberRole', () => {
    it('should update role and write audit log', async () => {
      const existingMembership = makeMembership('MEMBER');
      const updatedMembership = makeMembership('ADMIN');
      membershipsRepository.findByUserAndOrg.mockResolvedValue(
        existingMembership,
      );
      membershipsRepository.updateRole.mockResolvedValue(updatedMembership);
      usersRepository.findById.mockResolvedValue(fakeUser);

      const result = await service.updateMemberRole(
        organizationId,
        targetUserId,
        'ADMIN',
        actorId,
      );

      expect(result).toEqual({
        membership: updatedMembership,
        user: { id: fakeUser.id, name: fakeUser.name, email: fakeUser.email },
      });
      expect(membershipsRepository.updateRole).toHaveBeenCalledWith(
        organizationId,
        targetUserId,
        'ADMIN',
      );
      expect(auditLogsService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId,
          actorId,
          action: AUDIT_ACTION.MEMBER_ROLE_UPDATED,
          resource: 'membership',
          resourceId: updatedMembership.id,
          metadata: {
            userId: targetUserId,
            previousRole: 'MEMBER',
            newRole: 'ADMIN',
          },
        }),
      );
    });

    it('should throw BadRequestException when trying to change own role', async () => {
      await expect(
        service.updateMemberRole(organizationId, actorId, 'ADMIN', actorId),
      ).rejects.toThrow(BadRequestException);

      expect(membershipsRepository.findByUserAndOrg).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when target member does not exist', async () => {
      membershipsRepository.findByUserAndOrg.mockResolvedValue(undefined);

      await expect(
        service.updateMemberRole(
          organizationId,
          targetUserId,
          'ADMIN',
          actorId,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when trying to change owner role', async () => {
      membershipsRepository.findByUserAndOrg.mockResolvedValue(
        makeMembership('OWNER'),
      );

      await expect(
        service.updateMemberRole(
          organizationId,
          targetUserId,
          'ADMIN',
          actorId,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(membershipsRepository.updateRole).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException with descriptive message for owner role change', async () => {
      membershipsRepository.findByUserAndOrg.mockResolvedValue(
        makeMembership('OWNER'),
      );

      await expect(
        service.updateMemberRole(
          organizationId,
          targetUserId,
          'MEMBER',
          actorId,
        ),
      ).rejects.toThrow('The owner role cannot be changed');
    });
  });

  describe('removeMember', () => {
    it('should remove member and write audit log', async () => {
      const membership = makeMembership('MEMBER');
      membershipsRepository.findByUserAndOrg.mockResolvedValue(membership);
      membershipsRepository.deleteByOrgAndUser.mockResolvedValue(undefined);

      await service.removeMember(organizationId, targetUserId, actorId);

      expect(membershipsRepository.deleteByOrgAndUser).toHaveBeenCalledWith(
        organizationId,
        targetUserId,
      );
      expect(auditLogsService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId,
          actorId,
          action: AUDIT_ACTION.MEMBER_REMOVED,
          resource: 'membership',
          resourceId: membership.id,
          metadata: { userId: targetUserId },
        }),
      );
    });

    it('should throw BadRequestException when trying to remove self', async () => {
      await expect(
        service.removeMember(organizationId, actorId, actorId),
      ).rejects.toThrow(BadRequestException);

      expect(membershipsRepository.findByUserAndOrg).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when target member does not exist', async () => {
      membershipsRepository.findByUserAndOrg.mockResolvedValue(undefined);

      await expect(
        service.removeMember(organizationId, targetUserId, actorId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when trying to remove the owner', async () => {
      membershipsRepository.findByUserAndOrg.mockResolvedValue(
        makeMembership('OWNER'),
      );

      await expect(
        service.removeMember(organizationId, targetUserId, actorId),
      ).rejects.toThrow(BadRequestException);

      expect(membershipsRepository.deleteByOrgAndUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException with descriptive message for owner removal', async () => {
      membershipsRepository.findByUserAndOrg.mockResolvedValue(
        makeMembership('OWNER'),
      );

      await expect(
        service.removeMember(organizationId, targetUserId, actorId),
      ).rejects.toThrow('The owner cannot be removed');
    });

    it('should not write audit log when removal fails', async () => {
      membershipsRepository.findByUserAndOrg.mockResolvedValue(
        makeMembership('OWNER'),
      );

      await expect(
        service.removeMember(organizationId, targetUserId, actorId),
      ).rejects.toThrow();

      expect(auditLogsService.log).not.toHaveBeenCalled();
    });
  });
});
