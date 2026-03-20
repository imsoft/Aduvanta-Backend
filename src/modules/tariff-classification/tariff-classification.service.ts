import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { AUDIT_ACTION } from '../audit-logs/audit-log.actions.js';
import {
  TariffClassificationRepository,
  type TariffSectionRecord,
  type TariffChapterRecord,
  type TariffHeadingRecord,
  type TariffSubheadingRecord,
  type TariffFractionRecord,
} from './tariff-classification.repository.js';
import type { CreateTariffSectionDto } from './dto/create-tariff-section.dto.js';
import type { UpdateTariffSectionDto } from './dto/update-tariff-section.dto.js';
import type { CreateTariffChapterDto } from './dto/create-tariff-chapter.dto.js';
import type { CreateTariffHeadingDto } from './dto/create-tariff-heading.dto.js';
import type { CreateTariffSubheadingDto } from './dto/create-tariff-subheading.dto.js';
import type { CreateTariffFractionDto } from './dto/create-tariff-fraction.dto.js';

@Injectable()
export class TariffClassificationService {
  constructor(
    private readonly repository: TariffClassificationRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  // --- Sections ---

  async listSections(): Promise<TariffSectionRecord[]> {
    return this.repository.findAllSections();
  }

  async getSectionById(id: string): Promise<TariffSectionRecord> {
    const section = await this.repository.findSectionById(id);

    if (!section) {
      throw new NotFoundException(`Tariff section ${id} not found`);
    }

    return section;
  }

  async createSection(
    dto: CreateTariffSectionDto,
    actorId: string,
    organizationId: string,
  ): Promise<TariffSectionRecord> {
    const section = await this.repository.insertSection(dto);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.TARIFF_SECTION_CREATED,
      resource: 'tariff_section',
      resourceId: section.id,
      metadata: { code: section.code, title: section.title },
    });

    return section;
  }

  async updateSection(
    id: string,
    dto: UpdateTariffSectionDto,
    actorId: string,
    organizationId: string,
  ): Promise<TariffSectionRecord> {
    await this.getSectionById(id);

    const updated = await this.repository.updateSection(id, dto);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.TARIFF_SECTION_UPDATED,
      resource: 'tariff_section',
      resourceId: id,
      metadata: { ...dto },
    });

    return updated;
  }

  async deleteSection(
    id: string,
    actorId: string,
    organizationId: string,
  ): Promise<void> {
    const section = await this.getSectionById(id);

    await this.repository.deleteSection(id);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.TARIFF_SECTION_DELETED,
      resource: 'tariff_section',
      resourceId: id,
      metadata: { code: section.code, title: section.title },
    });
  }

  // --- Chapters ---

  async listChaptersBySection(
    sectionId: string,
  ): Promise<TariffChapterRecord[]> {
    await this.getSectionById(sectionId);
    return this.repository.findChaptersBySection(sectionId);
  }

  async getChapterById(id: string): Promise<TariffChapterRecord> {
    const chapter = await this.repository.findChapterById(id);

    if (!chapter) {
      throw new NotFoundException(`Tariff chapter ${id} not found`);
    }

    return chapter;
  }

  async createChapter(
    dto: CreateTariffChapterDto,
    actorId: string,
    organizationId: string,
  ): Promise<TariffChapterRecord> {
    await this.getSectionById(dto.sectionId);

    const chapter = await this.repository.insertChapter(dto);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.TARIFF_CHAPTER_CREATED,
      resource: 'tariff_chapter',
      resourceId: chapter.id,
      metadata: { code: chapter.code, title: chapter.title },
    });

    return chapter;
  }

  // --- Headings ---

  async listHeadingsByChapter(
    chapterId: string,
  ): Promise<TariffHeadingRecord[]> {
    await this.getChapterById(chapterId);
    return this.repository.findHeadingsByChapter(chapterId);
  }

  async getHeadingById(id: string): Promise<TariffHeadingRecord> {
    const heading = await this.repository.findHeadingById(id);

    if (!heading) {
      throw new NotFoundException(`Tariff heading ${id} not found`);
    }

    return heading;
  }

  async createHeading(
    dto: CreateTariffHeadingDto,
    actorId: string,
    organizationId: string,
  ): Promise<TariffHeadingRecord> {
    await this.getChapterById(dto.chapterId);

    const heading = await this.repository.insertHeading(dto);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.TARIFF_HEADING_CREATED,
      resource: 'tariff_heading',
      resourceId: heading.id,
      metadata: { code: heading.code, title: heading.title },
    });

    return heading;
  }

  // --- Subheadings ---

  async listSubheadingsByHeading(
    headingId: string,
  ): Promise<TariffSubheadingRecord[]> {
    await this.getHeadingById(headingId);
    return this.repository.findSubheadingsByHeading(headingId);
  }

  async getSubheadingById(id: string): Promise<TariffSubheadingRecord> {
    const subheading = await this.repository.findSubheadingById(id);

    if (!subheading) {
      throw new NotFoundException(`Tariff subheading ${id} not found`);
    }

    return subheading;
  }

  async createSubheading(
    dto: CreateTariffSubheadingDto,
    actorId: string,
    organizationId: string,
  ): Promise<TariffSubheadingRecord> {
    await this.getHeadingById(dto.headingId);

    const subheading = await this.repository.insertSubheading(dto);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.TARIFF_SUBHEADING_CREATED,
      resource: 'tariff_subheading',
      resourceId: subheading.id,
      metadata: { code: subheading.code, title: subheading.title },
    });

    return subheading;
  }

  // --- Fractions ---

  async listFractionsBySubheading(
    subheadingId: string,
  ): Promise<TariffFractionRecord[]> {
    await this.getSubheadingById(subheadingId);
    return this.repository.findFractionsBySubheading(subheadingId);
  }

  async getFractionById(id: string): Promise<TariffFractionRecord> {
    const fraction = await this.repository.findFractionById(id);

    if (!fraction) {
      throw new NotFoundException(`Tariff fraction ${id} not found`);
    }

    return fraction;
  }

  async getFractionByCode(code: string): Promise<TariffFractionRecord> {
    const fraction = await this.repository.findFractionByCode(code);

    if (!fraction) {
      throw new NotFoundException(
        `Tariff fraction with code ${code} not found`,
      );
    }

    return fraction;
  }

  async createFraction(
    dto: CreateTariffFractionDto,
    actorId: string,
    organizationId: string,
  ): Promise<TariffFractionRecord> {
    await this.getSubheadingById(dto.subheadingId);

    const fraction = await this.repository.insertFraction(dto);

    await this.auditLogsService.log({
      organizationId,
      actorId,
      action: AUDIT_ACTION.TARIFF_FRACTION_CREATED,
      resource: 'tariff_fraction',
      resourceId: fraction.id,
      metadata: { code: fraction.code, description: fraction.description },
    });

    return fraction;
  }

  // --- Search ---

  async searchFractions(
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ fractions: TariffFractionRecord[]; total: number }> {
    return this.repository.searchFractions(query, limit, offset);
  }

  // --- Fraction Details (regulations + preferences) ---

  async getFractionDetails(id: string) {
    const fraction = await this.getFractionById(id);
    const [regulations, preferences] = await Promise.all([
      this.repository.findRegulationsByFraction(id),
      this.repository.findPreferencesByFraction(id),
    ]);

    return {
      ...fraction,
      regulations,
      agreementPreferences: preferences.map(({ preference, agreement }) => ({
        ...preference,
        agreement,
      })),
    };
  }
}
