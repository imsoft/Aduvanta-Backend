import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BillingOverridesRepository } from './billing-overrides.repository.js';
import type { CreateBillingOverrideDto, UpdateBillingOverrideDto } from './billing-overrides.schema.js';

@Injectable()
export class BillingOverridesService {
  constructor(private readonly repo: BillingOverridesRepository) {}

  async listAll() {
    return this.repo.findAll();
  }

  async listActive() {
    return this.repo.findActive();
  }

  async getByOrganization(organizationId: string) {
    return this.repo.findByOrganization(organizationId);
  }

  async create(dto: CreateBillingOverrideDto, createdById: string) {
    const existing = await this.repo.findByOrganization(dto.organizationId);
    if (existing) {
      throw new ConflictException(
        `Organization ${dto.organizationId} already has a billing override. Update or delete it first.`,
      );
    }

    const discountPercent = dto.discountPercent ?? 100;

    return this.repo.create({
      organizationId: dto.organizationId,
      discountPercent,
      isFree: discountPercent === 100,
      note: dto.note,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      createdById,
    });
  }

  async update(id: string, dto: UpdateBillingOverrideDto) {
    const all = await this.repo.findAll();
    const existing = all.find((o) => o.id === id);
    if (!existing) {
      throw new NotFoundException(`Billing override ${id} not found`);
    }

    const discountPercent = dto.discountPercent ?? existing.discountPercent;
    const isFree = discountPercent === 100;

    return this.repo.update(id, {
      discountPercent,
      isFree,
      ...(dto.note !== undefined && { note: dto.note }),
      ...(dto.validUntil !== undefined && {
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
      }),
    });
  }

  async delete(id: string) {
    const all = await this.repo.findAll();
    const existing = all.find((o) => o.id === id);
    if (!existing) {
      throw new NotFoundException(`Billing override ${id} not found`);
    }
    await this.repo.delete(id);
  }
}
