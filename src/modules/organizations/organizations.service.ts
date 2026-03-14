import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE, type Database } from '../../database/database.module.js';
import { memberships, organizations } from '../../database/schema/index.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import { MembershipsRepository } from '../memberships/memberships.repository.js';
import { OrganizationsRepository } from './organizations.repository.js';
import type { OrganizationRecord } from './organizations.repository.js';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly organizationsRepository: OrganizationsRepository,
    private readonly membershipsRepository: MembershipsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(name: string, userId: string): Promise<OrganizationRecord> {
    const baseSlug = toSlug(name);
    const slug = await this.resolveUniqueSlug(baseSlug);

    const org = await this.db.transaction(async (tx) => {
      const [created] = await tx
        .insert(organizations)
        .values({ name, slug, createdById: userId })
        .returning();

      await tx.insert(memberships).values({
        organizationId: created.id,
        userId,
        role: 'OWNER',
      });

      return created;
    });

    await this.auditLogsService.log({
      organizationId: org.id,
      actorId: userId,
      action: AUDIT_ACTION.ORGANIZATION_CREATED,
      resource: 'organization',
      resourceId: org.id,
      metadata: { name: org.name, slug: org.slug },
    });

    return org;
  }

  async getById(
    id: string,
    requestingUserId: string,
  ): Promise<OrganizationRecord> {
    const org = await this.organizationsRepository.findById(id);

    if (!org) {
      throw new NotFoundException(`Organization ${id} not found`);
    }

    const membership = await this.membershipsRepository.findByUserAndOrg(
      requestingUserId,
      id,
    );

    if (!membership) {
      throw new NotFoundException(`Organization ${id} not found`);
    }

    return org;
  }

  async listForUser(
    userId: string,
  ): Promise<Array<OrganizationRecord & { role: string }>> {
    const rows =
      await this.membershipsRepository.findOrganizationsByUserId(userId);

    return rows.map(({ organization, membership }) => ({
      ...organization,
      role: membership.role,
    }));
  }

  private async resolveUniqueSlug(base: string): Promise<string> {
    const existing = await this.organizationsRepository.findBySlug(base);

    if (!existing) {
      return base;
    }

    const suffix = Date.now().toString(36);
    const candidate = `${base}-${suffix}`;

    const conflict = await this.organizationsRepository.findBySlug(candidate);

    if (conflict) {
      throw new ConflictException(
        'Could not generate a unique slug for this organization name. Please try a different name.',
      );
    }

    return candidate;
  }
}
