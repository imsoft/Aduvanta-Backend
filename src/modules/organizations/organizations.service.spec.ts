import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrganizationsService } from './organizations.service.js';
import { OrganizationsRepository } from './organizations.repository.js';
import { MembershipsRepository } from '../memberships/memberships.repository.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { DATABASE } from '../../database/database.module.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let organizationsRepository: {
    findById: jest.Mock;
    findBySlug: jest.Mock;
  };
  let membershipsRepository: {
    findByUserAndOrg: jest.Mock;
    findOrganizationsByUserId: jest.Mock;
  };
  let auditLogsService: { log: jest.Mock };
  let db: { transaction: jest.Mock };

  const userId = 'user-1';
  const orgId = 'org-1';

  const fakeOrg = {
    id: orgId,
    name: 'Test Org',
    slug: 'test-org',
    createdById: userId,
    logoUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const fakeMembership = {
    id: 'membership-1',
    organizationId: orgId,
    userId,
    role: 'OWNER' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    organizationsRepository = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
    };

    membershipsRepository = {
      findByUserAndOrg: jest.fn(),
      findOrganizationsByUserId: jest.fn(),
    };

    auditLogsService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    db = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: OrganizationsRepository, useValue: organizationsRepository },
        { provide: MembershipsRepository, useValue: membershipsRepository },
        { provide: AuditLogsService, useValue: auditLogsService },
        { provide: DATABASE, useValue: db },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  describe('create', () => {
    it('should create organization with owner membership and audit log', async () => {
      organizationsRepository.findBySlug.mockResolvedValue(undefined);

      db.transaction.mockImplementation(
        async (fn: (tx: unknown) => Promise<unknown>) => {
          const txProxy = {
            insert: jest.fn().mockImplementation(() => ({
              values: jest.fn().mockImplementation(() => ({
                returning: jest.fn().mockResolvedValue([fakeOrg]),
              })),
            })),
          };
          return fn(txProxy);
        },
      );

      const result = await service.create('Test Org', userId);

      expect(result).toEqual(fakeOrg);
      expect(db.transaction).toHaveBeenCalled();
      expect(auditLogsService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: fakeOrg.id,
          actorId: userId,
          action: AUDIT_ACTION.ORGANIZATION_CREATED,
          resource: 'organization',
          resourceId: fakeOrg.id,
          metadata: { name: fakeOrg.name, slug: fakeOrg.slug },
        }),
      );
    });

    it('should generate a unique slug when base slug is taken', async () => {
      organizationsRepository.findBySlug
        .mockResolvedValueOnce(fakeOrg) // base slug taken
        .mockResolvedValueOnce(undefined); // suffixed slug available

      db.transaction.mockImplementation(
        async (fn: (tx: unknown) => Promise<unknown>) => {
          const txProxy = {
            insert: jest.fn().mockImplementation(() => ({
              values: jest.fn().mockImplementation(() => ({
                returning: jest
                  .fn()
                  .mockResolvedValue([{ ...fakeOrg, slug: 'test-org-abc123' }]),
              })),
            })),
          };
          return fn(txProxy);
        },
      );

      const result = await service.create('Test Org', userId);

      expect(result.slug).not.toBe('test-org');
      expect(organizationsRepository.findBySlug).toHaveBeenCalledTimes(2);
    });
  });

  describe('getById', () => {
    it('should return organization when user is a member', async () => {
      organizationsRepository.findById.mockResolvedValue(fakeOrg);
      membershipsRepository.findByUserAndOrg.mockResolvedValue(fakeMembership);

      const result = await service.getById(orgId, userId);

      expect(result).toEqual(fakeOrg);
      expect(organizationsRepository.findById).toHaveBeenCalledWith(orgId);
      expect(membershipsRepository.findByUserAndOrg).toHaveBeenCalledWith(
        userId,
        orgId,
      );
    });

    it('should throw NotFoundException when organization does not exist', async () => {
      organizationsRepository.findById.mockResolvedValue(undefined);

      await expect(service.getById('non-existent', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when user is not a member', async () => {
      organizationsRepository.findById.mockResolvedValue(fakeOrg);
      membershipsRepository.findByUserAndOrg.mockResolvedValue(undefined);

      await expect(service.getById(orgId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not reveal organization existence to non-members', async () => {
      organizationsRepository.findById.mockResolvedValue(fakeOrg);
      membershipsRepository.findByUserAndOrg.mockResolvedValue(undefined);

      await expect(service.getById(orgId, 'other-user')).rejects.toThrow(
        `Organization ${orgId} not found`,
      );
    });
  });

  describe('listForUser', () => {
    it('should return organizations with roles for the user', async () => {
      membershipsRepository.findOrganizationsByUserId.mockResolvedValue([
        { organization: fakeOrg, membership: fakeMembership },
      ]);

      const result = await service.listForUser(userId);

      expect(result).toEqual([{ ...fakeOrg, role: 'OWNER' }]);
      expect(
        membershipsRepository.findOrganizationsByUserId,
      ).toHaveBeenCalledWith(userId);
    });

    it('should return empty array when user has no organizations', async () => {
      membershipsRepository.findOrganizationsByUserId.mockResolvedValue([]);

      const result = await service.listForUser(userId);

      expect(result).toEqual([]);
    });

    it('should return multiple organizations with their respective roles', async () => {
      const secondOrg = { ...fakeOrg, id: 'org-2', name: 'Second Org' };
      const secondMembership = {
        ...fakeMembership,
        id: 'membership-2',
        organizationId: 'org-2',
        role: 'MEMBER' as const,
      };

      membershipsRepository.findOrganizationsByUserId.mockResolvedValue([
        { organization: fakeOrg, membership: fakeMembership },
        { organization: secondOrg, membership: secondMembership },
      ]);

      const result = await service.listForUser(userId);

      expect(result).toHaveLength(2);
      expect(result[0].role).toBe('OWNER');
      expect(result[1].role).toBe('MEMBER');
    });
  });
});
