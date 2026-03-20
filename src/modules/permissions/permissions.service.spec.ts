import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { PermissionsService } from './permissions.service.js';
import { MembershipsRepository } from '../memberships/memberships.repository.js';
import { PERMISSION } from './permission.codes.js';
import { ROLE_PERMISSIONS } from './permission.map.js';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let membershipsRepository: { findByUserAndOrg: jest.Mock };

  const userId = 'user-1';
  const organizationId = 'org-1';

  function makeMembership(role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'CLIENT') {
    return {
      id: 'membership-1',
      organizationId,
      userId,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  beforeEach(async () => {
    membershipsRepository = {
      findByUserAndOrg: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: MembershipsRepository, useValue: membershipsRepository },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  describe('hasPermission', () => {
    it('should return true when user has a valid membership with the requested permission', async () => {
      membershipsRepository.findByUserAndOrg.mockResolvedValue(
        makeMembership('MEMBER'),
      );

      const result = await service.hasPermission(
        userId,
        organizationId,
        PERMISSION.ORGANIZATIONS_READ,
      );

      expect(result).toBe(true);
      expect(membershipsRepository.findByUserAndOrg).toHaveBeenCalledWith(
        userId,
        organizationId,
      );
    });

    it('should return false when user has no membership in the organization', async () => {
      membershipsRepository.findByUserAndOrg.mockResolvedValue(undefined);

      const result = await service.hasPermission(
        userId,
        organizationId,
        PERMISSION.ORGANIZATIONS_READ,
      );

      expect(result).toBe(false);
    });

    it('should return false when the role does not include the requested permission', async () => {
      membershipsRepository.findByUserAndOrg.mockResolvedValue(
        makeMembership('MEMBER'),
      );

      const result = await service.hasPermission(
        userId,
        organizationId,
        PERMISSION.ORGANIZATIONS_DELETE,
      );

      expect(result).toBe(false);
    });

    it('should return false for CLIENT role accessing internal permissions', async () => {
      membershipsRepository.findByUserAndOrg.mockResolvedValue(
        makeMembership('CLIENT'),
      );

      const result = await service.hasPermission(
        userId,
        organizationId,
        PERMISSION.ORGANIZATIONS_READ,
      );

      expect(result).toBe(false);
    });

    it('should return true for CLIENT role accessing portal permissions', async () => {
      membershipsRepository.findByUserAndOrg.mockResolvedValue(
        makeMembership('CLIENT'),
      );

      const result = await service.hasPermission(
        userId,
        organizationId,
        PERMISSION.PORTAL_READ,
      );

      expect(result).toBe(true);
    });
  });

  describe('assertPermission', () => {
    it('should resolve without error when user has the permission', async () => {
      membershipsRepository.findByUserAndOrg.mockResolvedValue(
        makeMembership('ADMIN'),
      );

      await expect(
        service.assertPermission(
          userId,
          organizationId,
          PERMISSION.MEMBERS_INVITE,
        ),
      ).resolves.toBeUndefined();
    });

    it('should throw ForbiddenException when user lacks the permission', async () => {
      membershipsRepository.findByUserAndOrg.mockResolvedValue(
        makeMembership('MEMBER'),
      );

      await expect(
        service.assertPermission(
          userId,
          organizationId,
          PERMISSION.MEMBERS_INVITE,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user has no membership', async () => {
      membershipsRepository.findByUserAndOrg.mockResolvedValue(undefined);

      await expect(
        service.assertPermission(
          userId,
          organizationId,
          PERMISSION.ORGANIZATIONS_READ,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should include the permission code in the error message', async () => {
      membershipsRepository.findByUserAndOrg.mockResolvedValue(undefined);

      await expect(
        service.assertPermission(
          userId,
          organizationId,
          PERMISSION.MEMBERS_INVITE,
        ),
      ).rejects.toThrow(`Missing permission: ${PERMISSION.MEMBERS_INVITE}`);
    });
  });

  describe('role hierarchy', () => {
    it('OWNER should have all ADMIN permissions', () => {
      const ownerPerms = ROLE_PERMISSIONS.OWNER;
      const adminPerms = ROLE_PERMISSIONS.ADMIN;

      for (const perm of adminPerms) {
        expect(ownerPerms).toContain(perm);
      }
    });

    it('ADMIN should have all MEMBER permissions', () => {
      const adminPerms = ROLE_PERMISSIONS.ADMIN;
      const memberPerms = ROLE_PERMISSIONS.MEMBER;

      for (const perm of memberPerms) {
        expect(adminPerms).toContain(perm);
      }
    });

    it('OWNER should have permissions that ADMIN does not', async () => {
      membershipsRepository.findByUserAndOrg.mockResolvedValue(
        makeMembership('OWNER'),
      );
      const ownerResult = await service.hasPermission(
        userId,
        organizationId,
        PERMISSION.ORGANIZATIONS_DELETE,
      );
      expect(ownerResult).toBe(true);

      membershipsRepository.findByUserAndOrg.mockResolvedValue(
        makeMembership('ADMIN'),
      );
      const adminResult = await service.hasPermission(
        userId,
        organizationId,
        PERMISSION.ORGANIZATIONS_DELETE,
      );
      expect(adminResult).toBe(false);
    });

    it('ADMIN should have permissions that MEMBER does not', async () => {
      membershipsRepository.findByUserAndOrg.mockResolvedValue(
        makeMembership('ADMIN'),
      );
      const adminResult = await service.hasPermission(
        userId,
        organizationId,
        PERMISSION.MEMBERS_INVITE,
      );
      expect(adminResult).toBe(true);

      membershipsRepository.findByUserAndOrg.mockResolvedValue(
        makeMembership('MEMBER'),
      );
      const memberResult = await service.hasPermission(
        userId,
        organizationId,
        PERMISSION.MEMBERS_INVITE,
      );
      expect(memberResult).toBe(false);
    });

    it('CLIENT permissions should be disjoint from MEMBER permissions', () => {
      const clientPerms = ROLE_PERMISSIONS.CLIENT;
      const memberPerms = ROLE_PERMISSIONS.MEMBER;

      for (const perm of clientPerms) {
        expect(memberPerms).not.toContain(perm);
      }
    });
  });
});
